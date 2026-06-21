import time
import asyncio
from app.core.database import SessionLocal
from app.models.domain import JobPosition, Candidate, JobMatch, Tenant
from app.api.jobs import match_candidates
from app.services.match_engine import generate_match_justification

# Classe mock de User para suprir o parâmetro current_user do endpoint
class MockUser:
    def __init__(self, tenant_id):
        self.tenant_id = tenant_id

async def run_tests():
    print("--- INICIANDO TESTES DO MOTOR DE MATCH (FASE 1D) ---")
    db = SessionLocal()
    try:
        # 1. Recuperar Tenant, Job e Candidato do banco
        tenant = db.query(Tenant).first()
        if not tenant:
            print("❌ ERRO: Nenhum tenant encontrado no banco de dados!")
            return
        print(f"✅ Tenant recuperado: {tenant.name} ({tenant.id})")
        
        job = db.query(JobPosition).filter(JobPosition.tenant_id == tenant.id).first()
        if not job:
            print("❌ ERRO: Nenhuma vaga encontrada no banco de dados! Cadastre uma vaga para rodar o teste.")
            return
        print(f"✅ Vaga recuperada: {job.title} ({job.id})")
        print(f"   Skills da vaga: {job.required_skills}")
        
        # Limpar matches anteriores para garantir um teste do "cold path" (primeira execução)
        print("🧹 Limpando matches existentes para esta vaga no banco...")
        db.query(JobMatch).filter(JobMatch.job_id == job.id).delete()
        db.commit()
        
        # Adicionar skill 'eletrônica' ao primeiro candidato para garantir score > 0 e testar chamada de IA
        from app.models.domain import Skill
        cand = db.query(Candidate).filter(Candidate.tenant_id == tenant.id).first()
        elec_skill = None
        if cand:
            elec_skill = db.query(Skill).filter(Skill.name.ilike("eletrônica"), Skill.tenant_id == tenant.id).first()
            if not elec_skill:
                elec_skill = Skill(name="eletrônica", tenant_id=tenant.id)
                db.add(elec_skill)
                db.flush()
            if elec_skill not in cand.skills:
                cand.skills.append(elec_skill)
                db.commit()
                print(f"➕ Adicionada skill 'eletrônica' temporariamente ao candidato '{cand.full_name}' para forçar score > 0.")
        
        mock_user = MockUser(tenant_id=tenant.id)
        
        # 2. Primeira Execução: Deve calcular e chamar a IA (Groq/Gemini) para quem tiver score > 0
        print("\n⚡ [Primeira Chamada] Calculando matches (Cold Path - Chamada de IA)...")
        start_time = time.time()
        result_cold = await match_candidates(job_id=str(job.id), db=db, current_user=mock_user)
        cold_duration = time.time() - start_time
        print(f"⏱️ Tempo total (Cold Path): {cold_duration:.2f} segundos")
        
        matches_cold = result_cold.get("matches", [])
        print(f"📊 Total de candidatos analisados: {len(matches_cold)}")
        
        # Exibe o ranking e se há justificativa
        has_ai_justification = False
        for idx, m in enumerate(matches_cold[:3]):
            just = m.get("match_justification")
            print(f"   #{idx+1} {m['full_name']} | Score: {m['match_score']}%")
            if just:
                print(f"      ✨ Justificativa: {just}")
                if "competências técnicas" not in just.lower() and "não possui" not in just.lower():
                    has_ai_justification = True
        
        # 3. Verificar persistência no banco
        db_matches = db.query(JobMatch).filter(JobMatch.job_id == job.id).all()
        print(f"\n📂 Matches persistidos no banco de dados: {len(db_matches)} registros.")
        if len(db_matches) == 0:
            print("❌ ERRO: Nenhum match foi persistido na tabela job_matches!")
        else:
            print("✅ Sucesso: Matches gravados corretamente no banco de dados.")
            
        # 4. Segunda Execução: Deve usar o Cache do banco e ser extremamente rápido (< 50ms)
        print("\n⚡ [Segunda Chamada] Calculando matches (Warm Path - Cache do Banco)...")
        start_time = time.time()
        result_warm = await match_candidates(job_id=str(job.id), db=db, current_user=mock_user)
        warm_duration = time.time() - start_time
        print(f"⏱️ Tempo total (Warm Path): {warm_duration * 1000:.2f} ms")
        
        if warm_duration < 0.2: # menos de 200ms
            print("✅ Sucesso: O cache do banco de dados respondeu de forma ultra rápida!")
        else:
            print("⚠️ Aviso: O tempo de resposta foi maior que o esperado para leitura direta do banco.")
            
        # Verificar se as informações retornadas no Warm Path são idênticas
        matches_warm = result_warm.get("matches", [])
        if len(matches_cold) == len(matches_warm) and matches_cold[0]["match_justification"] == matches_warm[0]["match_justification"]:
            print("✅ Sucesso: Os dados do cache coincidem perfeitamente com os dados originais.")
        else:
            print("❌ ERRO: Discrepância de dados entre a primeira e a segunda chamada!")

        # 5. Testar Invalidação de Cache ao atualizar a vaga
        print("\n⚡ Testando invalidação de cache...")
        from app.api.jobs import update_job, JobUpdate
        
        # Faz uma atualização simples no título da vaga
        update_data = JobUpdate(title=job.title + " (Atualizado)")
        update_job(job_id=str(job.id), job_update=update_data, db=db, current_user=mock_user)
        
        # Verifica se o cache foi limpo
        db_matches_after = db.query(JobMatch).filter(JobMatch.job_id == job.id).all()
        print(f"📂 Matches no banco após atualização da vaga: {len(db_matches_after)} registros.")
        if len(db_matches_after) == 0:
            print("✅ Sucesso: O cache foi invalidado (deletado) corretamente ao atualizar a vaga!")
        else:
            print("❌ ERRO: O cache de matches permaneceu no banco após atualização da vaga!")
            
        # Restaura o título original da vaga
        job.title = job.title.replace(" (Atualizado)", "")
        db.commit()
        print("🔄 Título da vaga restaurado.")

    finally:
        # Remover skill temporária
        if 'cand' in locals() and cand and 'elec_skill' in locals() and elec_skill and elec_skill in cand.skills:
            cand.skills.remove(elec_skill)
            db.commit()
            print(f"➖ Removida skill 'eletrônica' temporária do candidato '{cand.full_name}'.")
        db.close()

if __name__ == "__main__":
    asyncio.run(run_tests())

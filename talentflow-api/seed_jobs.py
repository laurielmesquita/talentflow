import sys
import os
from datetime import date

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models.domain import JobPosition

def seed_jobs():
    db = SessionLocal()
    
    # Exemplo 1
    job1_title = "Técnico em Eletrônica / Manutenção de Dispositivos Móveis (M/F)"
    existing1 = db.query(JobPosition).filter(JobPosition.title == job1_title).first()
    
    if not existing1:
        job1 = JobPosition(
            title=job1_title,
            description=(
                "Somos uma Assistência Técnica Autorizada Samsung em Teresina-PI. "
                "Atuamos com alto padrão de qualidade mundial, seguindo processos internos rigorosos, "
                "com foco em excelência, agilidade e total segurança para os nossos clientes. "
                "Buscamos profissionais comprometidos e disciplinados para integrar nossa equipe técnica."
            ),
            location="Teresina - PI",
            employment_type="CLT (Efetivo)",
            work_model="Presencial",
            responsibilities=(
                "• Realizar diagnóstico preciso e manutenção (corretiva e preventiva) em Smartphones, Smartwatches (relógios), Tablets e Notebooks.\n"
                "• Executar reparos de alta complexidade, incluindo soldas, microeletrônica em placas-mãe e troca de componentes internos.\n"
                "• Realizar a substituição de módulos, telas, baterias e carcaças seguindo os manuais técnicos do fabricante.\n"
                "• Utilizar softwares e ferramentas oficiais de diagnóstico e calibração da marca.\n"
                "• Registrar detalhadamente os laudos técnicos e o status dos reparos no sistema interno de Ordens de Serviço (O.S.).\n"
                "• Garantir o cumprimento rigoroso dos prazos e metas diárias de produtividade e qualidade (KPIs)."
            ),
            requirements=(
                "• Curso Técnico em Eletrônica, Eletrotécnica ou áreas afins; OU sólida experiência comprovada na área de manutenção de dispositivos móveis e informática.\n"
                "• Conhecimento prático em microeletrônica, solda e diagnóstico de placas.\n"
                "• Perfil extremamente responsável, pontual e disciplinado com horários.\n"
                "• Ética profissional inquestionável e total discrição com dados e informações de clientes (Sigilo de Informações).\n"
                "• Foco em resultados, capacidade de trabalhar sob pressão e foco no cumprimento de metas."
            ),
            benefits=(
                "• Salário Fixo (compatível com o mercado) - Regime CLT.\n"
                "• Plano de Incentivos: Premiações financeiras por atingimento e superação dos KPIs de qualidade e tempo de reparo monitorados pela Samsung.\n"
                "• Vale-Transporte.\n"
                "• Vale-Alimentação.\n"
                "• Day Off no dia do aniversário."
            ),
            application_email="plataforma.talentflow@outlook.com",
            application_subject="Vaga Técnico de Manutenção - Teresina",
            deadline=date(2026, 6, 30),
            required_skills="eletrônica, solda, microeletrônica, smartphones, hardware, eletrotécnica"
        )
        db.add(job1)
        print("Vaga 1 criada com sucesso!")
        
    # Exemplo 2 (Técnico em Eletrônica - Teresina - PI)
    job2_title = "Técnico em Eletrônica (Themos Vagas)"
    existing2 = db.query(JobPosition).filter(JobPosition.title == job2_title).first()
    
    if not existing2:
        job2 = JobPosition(
            title=job2_title,
            description="Vaga para Técnico em Eletrônica em Teresina - PI publicada no portal Themos Vagas. Profissional com perfil dinâmico e focado em excelência técnica.",
            location="Teresina - PI",
            employment_type="CLT (Efetivo)",
            work_model="Presencial",
            responsibilities=(
                "• Realizar manutenção e calibração de equipamentos eletrônicos.\n"
                "• Diagnosticar defeitos em circuitos integrados e placas eletrônicas.\n"
                "• Preencher relatórios de manutenção."
            ),
            requirements=(
                "• Curso técnico concluído em Eletrônica ou Eletrotécnica.\n"
                "• Experiência com instrumentos de medição (osciloscópio, multímetro).\n"
                "• Residir em Teresina - PI."
            ),
            benefits="• Salário fixo comercial\n• Vale-transporte\n• Vale-alimentação",
            application_email="rh.teresina@empresa.com",
            application_subject="Seleção Técnico Eletrônica Teresina",
            deadline=date(2026, 6, 25),
            required_skills="eletrônica, solda, multímetro, osciloscópio, circuitos"
        )
        db.add(job2)
        print("Vaga 2 criada com sucesso!")
        
    db.commit()
    db.close()
    print("Seed de vagas finalizado!")

if __name__ == "__main__":
    seed_jobs()

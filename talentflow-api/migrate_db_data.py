import os
import sys
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text

# URLs dos bancos
OLD_DATABASE_URL = "postgresql://neondb_owner:npg_PklqImc3zwX9@ep-snowy-resonance-aidyez2i.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
NEW_DATABASE_URL = "postgresql://neondb_owner:npg_eN2Otm7pfjJg@ep-tiny-lake-ac0r2j9h-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def migrate():
    print("Iniciando migração de dados respeitando restrições de chaves estrangeiras...")
    
    # Criar engines
    engine_old = create_engine(OLD_DATABASE_URL)
    engine_new = create_engine(NEW_DATABASE_URL)
    
    # Carregar metadados
    metadata_old = MetaData()
    metadata_old.reflect(bind=engine_old)
    
    # sorted_tables retorna as tabelas em ordem de dependência (pais antes de filhos)
    tables = metadata_old.sorted_tables
    
    # Estabelecer conexões
    conn_old = engine_old.connect()
    conn_new = engine_new.connect()
    
    trans_new = conn_new.begin()
    
    try:
        # 1. Limpar qualquer dado existente no novo banco (em ordem reversa de dependência)
        print("Limpando dados residuais do novo banco...")
        for table in reversed(tables):
            print(f"  Truncando tabela: {table.name}")
            conn_new.execute(text(f'TRUNCATE TABLE "{table.name}" CASCADE;'))
            
        # Dicionário para armazenar temporariamente os parent_ids de candidatos
        candidate_parent_ids = {}
        
        # 2. Copiar dados tabela por tabela na ordem de dependência
        print("\nCopiando dados...")
        for table in tables:
            # Selecionar todos os dados da tabela antiga
            rows = conn_old.execute(table.select()).fetchall()
            row_count = len(rows)
            print(f"  Tabela '{table.name}': {row_count} registros encontrados.")
            
            if row_count > 0:
                insert_data = []
                for row in rows:
                    row_dict = dict(row._mapping)
                    
                    # Tratar a auto-referência na tabela candidates
                    if table.name == "candidates":
                        # Armazenar o parent_id real e definir como None temporariamente
                        c_id = row_dict["id"]
                        p_id = row_dict["parent_id"]
                        if p_id is not None:
                            candidate_parent_ids[c_id] = p_id
                        row_dict["parent_id"] = None
                        
                    insert_data.append(row_dict)
                
                # Executar bulk insert
                conn_new.execute(table.insert(), insert_data)
                print(f"    ✓ {row_count} registros inseridos com sucesso.")
        
        # 3. Restaurar auto-referências da tabela candidates
        if candidate_parent_ids:
            print("\nRestaurando parent_id (auto-referência) da tabela candidates...")
            candidates_table = next(t for t in tables if t.name == "candidates")
            
            for c_id, p_id in candidate_parent_ids.items():
                conn_new.execute(
                    candidates_table.update()
                    .where(candidates_table.c.id == c_id)
                    .values(parent_id=p_id)
                )
            print(f"    ✓ {len(candidate_parent_ids)} links de parent_id restaurados.")
        
        # Confirmar transação
        trans_new.commit()
        print("\n🎉 Migração concluída com sucesso no Neon SP!")
        
    except Exception as e:
        print(f"\n❌ Erro durante a migração: {e}")
        trans_new.rollback()
        sys.exit(1)
    finally:
        conn_old.close()
        conn_new.close()

if __name__ == "__main__":
    migrate()

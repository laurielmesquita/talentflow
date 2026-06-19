import fitz
import os
from pathlib import Path

def generate_test_pdf():
    # Nome de um candidato que sabemos que existe no banco
    candidate_name = "Francisco de Paulo da Silva Filho"
    
    doc = fitz.open()
    page = doc.new_page()
    
    # Texto estruturado simulando novas informações para o candidato existente
    text = f"""{candidate_name}
Email: francisco.paulo.novo@example.com (DIFERENTE do cadastrado)
Telefone: (86) 99911-2233
Endereço: Teresina, Piauí

Áreas de Atuação:
Tecnologia, Suporte Técnico

Competências Técnicas:
Sistemas Operacionais, Redes de Computadores, Atendimento ao Cliente, Python, Docker (NOVA), Linux, Git (NOVA)

Experiência Profissional:
1. Space Square Solutions - Técnico de TI Sênior (2025 - Presente)
Liderança de equipe de infraestrutura, redução de chamados de suporte em 30% e automatização de deploys com Docker e shell scripting.

2. Oficina de Celulares Express - Auxiliar Técnico (2023 - 2025)
Manutenção física e lógica de dispositivos móveis de diversas marcas.
"""
    
    # Insere o texto na página
    page.insert_text((50, 50), text, fontsize=11, lineheight=1.4)
    
    # Salva o arquivo no diretório raiz do projeto para fácil acesso
    output_filename = "Teste_Conflito_Francisco_de_Paulo.pdf"
    doc.save(output_filename)
    doc.close()
    
    print(f"✅ PDF de teste gerado com sucesso: {output_filename}")
    print(f"Caminho absoluto: {Path(output_filename).resolve()}")

if __name__ == "__main__":
    generate_test_pdf()

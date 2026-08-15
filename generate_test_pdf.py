import fitz
from pathlib import Path

# PII 100% sintetica (sem correspondencia com candidatos reais).
# E-mail em dominio RFC 5737 (reserved) e dados ficticios.
CANDIDATE_NAME = "Candidato Sintetico de Teste"
CANDIDATE_EMAIL = "candidato.sintetico@example.com"
CANDIDATE_PHONE = "(00) 90000-0000"
CANDIDATE_CITY = "Cidade Teste, UF"
OUTPUT_PATH = Path(__file__).parent / "talentflow-api" / "tests" / "fixtures" / "synthetic_candidate.pdf"


def generate_test_pdf():
    doc = fitz.open()
    page = doc.new_page()

    text = f"""{CANDIDATE_NAME}
Email: {CANDIDATE_EMAIL}
Telefone: {CANDIDATE_PHONE}
Endereco: {CANDIDATE_CITY}

Areas de Atuacao:
Tecnologia, Suporte Tecnico

Competencias Tecnicas:
Sistemas Operacionais, Redes de Computadores, Atendimento ao Cliente, Python, Docker, Linux, Git

Experiencia Profissional:
1. Empresa Exemplo S.A. - Tecnico de TI Senior (2025 - Presente)
Lideranca de equipe de infraestrutura, reducao de chamados de suporte em 30% e automatizacao de deploys com Docker e shell scripting.

2. Empresa Demo LTDA - Auxiliar Tecnico (2023 - 2025)
Manutencao fisica e logica de dispositivos moveis de diversas marcas.
"""

    page.insert_text((50, 50), text, fontsize=11, lineheight=1.4)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(OUTPUT_PATH))
    doc.close()

    print(f"PDF sintetico gerado com sucesso: {OUTPUT_PATH}")


if __name__ == "__main__":
    generate_test_pdf()

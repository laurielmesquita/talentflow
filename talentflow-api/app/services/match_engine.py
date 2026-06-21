import os
from typing import List
from groq import Groq
from google import genai
from google.genai import types
from app.core.config import settings

def generate_match_justification(
    job_title: str,
    job_description: str,
    required_skills: str,
    candidate_name: str,
    candidate_skills: List[str],
    candidate_experiences: List[dict],
    matched_skills: List[str],
    score: float
) -> str:
    """
    Gera uma justificativa de compatibilidade profissional e curta (max 2 frases)
    usando Groq (Llama 3.3) ou Gemini (como fallback).
    """
    # Formata experiências
    exp_lines = []
    for exp in candidate_experiences:
        company = exp.get("company", exp.get("company_name", "Não informada"))
        title = exp.get("title", exp.get("job_title", "Não informado"))
        desc = exp.get("desc", exp.get("description", ""))
        desc_str = f" - {desc}" if desc else ""
        exp_lines.append(f"- {title} na empresa {company}{desc_str}")
    exp_str = "\n".join(exp_lines) if exp_lines else "Sem experiências cadastradas."

    skills_str = ", ".join(candidate_skills) if candidate_skills else "Nenhuma skill listada."
    matched_str = ", ".join(matched_skills) if matched_skills else "Nenhuma skill em comum."

    system_prompt = (
        "Você é um assistente de recrutamento especializado em analisar a compatibilidade entre candidatos e vagas de emprego.\n"
        "Escreva em português uma justificativa de compatibilidade curta, extremamente profissional, objetiva e direta, de no máximo 2 frases.\n"
        "Não inclua introduções como 'Aqui está...' ou saudações. Vá direto ao ponto, destacando quais habilidades do candidato combinam com a vaga e como a experiência dele é relevante."
    )

    user_prompt = f"""
Vaga: {job_title}
Descrição da Vaga: {job_description}
Habilidades Requeridas: {required_skills}

Candidato: {candidate_name}
Habilidades do Candidato: {skills_str}
Experiências do Candidato:
{exp_str}

Habilidades Compatíveis Identificadas: {matched_str}
Pontuação de Compatibilidade por Habilidades: {score}%
"""

    # 1. Tentar Groq
    groq_key = os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY
    if groq_key:
        try:
            print(f"[MatchEngine] Iniciando chamada ao Groq para o candidato {candidate_name}...")
            client = Groq(api_key=groq_key)
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=150
            )
            justification = response.choices[0].message.content.strip()
            if justification:
                print(f"[MatchEngine] Justificativa gerada com sucesso via Groq.")
                return justification
        except Exception as e:
            print(f"[MatchEngine] Erro ao chamar Groq: {e}. Tentando fallback Gemini...")

    # 2. Tentar Gemini como Fallback
    gemini_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    if gemini_key:
        try:
            print(f"[MatchEngine] Iniciando chamada ao Gemini para o candidato {candidate_name}...")
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[system_prompt + "\n\n" + user_prompt],
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=150
                )
            )
            justification = response.text.strip()
            if justification:
                print(f"[MatchEngine] Justificativa gerada com sucesso via Gemini.")
                return justification
        except Exception as e:
            print(f"[MatchEngine] Erro ao chamar Gemini: {e}")

    # 3. Fallback Estático
    print(f"[MatchEngine] Usando fallback estático para o candidato {candidate_name}.")
    if score == 0:
        return "O candidato não possui as competências técnicas obrigatórias especificadas para esta vaga."
    
    skills_intersection = f" (Habilidades compatíveis: {matched_str})." if matched_skills else "."
    return f"Candidato possui {score}% de compatibilidade técnica com base nas competências requeridas pela vaga{skills_intersection}"

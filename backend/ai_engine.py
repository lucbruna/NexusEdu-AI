import requests
from google import genai
from openai import OpenAI
from config import settings


def generate_ollama(prompt: str) -> str:
    response = requests.post(
        settings.ollama_url,
        json={"model": settings.ollama_model, "prompt": prompt, "stream": False},
        timeout=120
    )
    response.raise_for_status()
    return response.json().get("response", "")


def generate_gemini(prompt: str) -> str:
    client = genai.Client(api_key=settings.gemini_api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return response.text


def generate_openrouter(prompt: str) -> str:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.openrouter_api_key
    )
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Responda sempre em português do Brasil. Seja útil, claro e objetivo."},
            {"role": "user", "content": prompt}
        ]
    )
    return completion.choices[0].message.content


def generate_ai_response(prompt: str) -> str:
    print("\n===== PROMPT ENVIADO =====")
    print(prompt)
    print("=========================\n")

    if settings.gemini_api_key:
        try:
            print("Usando Gemini...")
            return generate_gemini(prompt)
        except Exception as e:
            print("Erro Gemini:", e)

    if settings.openrouter_api_key:
        try:
            print("Usando OpenRouter...")
            return generate_openrouter(prompt)
        except Exception as e:
            print("Erro OpenRouter:", e)

    try:
        print("Usando Ollama...")
        return generate_ollama(prompt)
    except Exception as e:
        print("Erro Ollama:", e)

    return "Erro: Nenhuma IA disponível."


def generate_lesson_response(topic: str) -> str:
    prompt = f"""
Você é um especialista em educação brasileira.

Crie um conteúdo pedagógico completo.

Tema: {topic}

Estruture com:
- Objetivo
- Explicação
- Exemplos
- Exercícios
- Conclusão

Responda em português.
"""
    return generate_ai_response(prompt)

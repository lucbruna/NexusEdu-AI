from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import ChatMemory
from ai_engine import generate_ai_response
from schemas import ChatRequest, ChatResponse, ChatHistoryResponse
from auth import get_current_user
from models import User

router = APIRouter(tags=["chat"])

RESUMO_MAX = 20
CONTEXTO_MAX = 10


@router.post("/chat")
def chat(data: ChatRequest, db: Session = Depends(get_db)):
    memories = (
        db.query(ChatMemory)
        .filter(ChatMemory.email == data.email)
        .order_by(ChatMemory.id.asc())
        .all()
    )

    # --- Intelligent Memory ---
    resumo_guardado = None
    for m in memories:
        if m.role == "summary":
            resumo_guardado = m.response

    recentes = [m for m in memories if m.role != "summary"]

    if len(recentes) > RESUMO_MAX:
        resumir = recentes[:-CONTEXTO_MAX]
        manter = recentes[-CONTEXTO_MAX:]

        bloco_resumo = "\n".join(
            f"Usuário: {m.message}\nIA: {m.response}" for m in resumir
        )

        prompt_resumo = f"""
Resuma em até 5 tópicos os principais assuntos e preferências
que o usuário mencionou nesta conversa educacional.

Histórico:
{bloco_resumo}

Resumo (apenas fatos importantes):
"""
        resumo = generate_ai_response(prompt_resumo)
        resumo_guardado = resumo

        ids_deletar = [m.id for m in resumir]
        db.query(ChatMemory).filter(ChatMemory.id.in_(ids_deletar)).delete(synchronize_session=False)

        summary_entry = ChatMemory(
            email=data.email,
            role="summary",
            message="",
            response=resumo
        )
        db.add(summary_entry)
        db.commit()
        recentes = manter

    # --- Build Context ---
    context = ""
    if resumo_guardado:
        context += f"\n[RESUMO DE CONVERSA ANTERIOR]\n{resumo_guardado}\n[/RESUMO]\n"

    for m in recentes[-CONTEXTO_MAX:]:
        context += f"\nUsuário: {m.message}\nIA: {m.response}\n"

    # --- Prompt ---
    prompt = f"""
Você é o NexusEdu AI, um assistente educacional inteligente.

Diretrizes:
- Responda sempre em português do Brasil
- Você possui MEMÓRIA de conversa: lembra do que foi dito antes
- Use o contexto da conversa para responder com continuidade
- Seja natural e direto em perguntas simples
- Apenas aprofunde em temas pedagógicos quando solicitado
- Se o usuário mudar de assunto, acompanhe naturalmente

Contexto da conversa:
{context}

Mensagem do usuário:
{data.message}
"""
    print("\n===== CHAT PROMPT =====")
    print(prompt)
    print("=======================\n")

    response = generate_ai_response(prompt)

    memory = ChatMemory(
        email=data.email,
        role="assistant",
        message=data.message,
        response=response
    )
    db.add(memory)
    db.commit()

    return {"response": response}


@router.get("/chat-history/{email}")
def get_chat_history(email: str, db: Session = Depends(get_db)):
    memories = (
        db.query(ChatMemory)
        .filter(ChatMemory.email == email, ChatMemory.role != "summary")
        .order_by(ChatMemory.created_at.asc())
        .all()
    )
    return memories

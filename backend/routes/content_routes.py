import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from pypdf import PdfReader
from docx import Document
from PIL import Image
import pytesseract
from database import get_db
from models import User, History, Lesson
from ai_engine import generate_ai_response, generate_lesson_response, generate_lesson_plan
from schemas import PromptRequest, LessonRequest
from auth import get_current_user
from config import settings

router = APIRouter(tags=["content"])

MAX_UPLOAD_SIZE = settings.max_upload_size_mb * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".png", ".jpg", ".jpeg"}

pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd


def validate_file(filename: str, content_length: int):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Formato {ext} não suportado. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    if content_length > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Arquivo muito grande. Máximo: {settings.max_upload_size_mb}MB"
        )


def save_temp_file(contents: bytes, suffix: str) -> str:
    fd, path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    with open(path, "wb") as f:
        f.write(contents)
    return path


@router.post("/generate")
def generate(data: PromptRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

    if user.plan == "free" and user.credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Limite diário atingido. Faça upgrade para PRO."
        )

    if user.plan == "free" and user.role != "admin":
        user.credits -= 1

    response_text = generate_ai_response(data.prompt)

    history = History(user_id=user.id, prompt=data.prompt, response=response_text)
    db.add(history)
    db.commit()

    return {"response": response_text, "credits": user.credits}


@router.post("/generate-test")
def generate_test(data: PromptRequest):
    prompt = f"""
Você é um professor brasileiro especialista.

Crie uma prova completa.

Tema:
{data.prompt}

A prova deve conter:
- Título
- 10 questões
- múltipla escolha
- alternativas A B C D
- gabarito no final
- linguagem adequada para alunos
- organização profissional

Responda em português.
"""
    response = generate_ai_response(prompt)
    return {"response": response}


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    validate_file(file.filename, len(contents))

    text = ""
    ext = os.path.splitext(file.filename)[1].lower()

    if ext == ".pdf":
        path = save_temp_file(contents, ".pdf")
        reader = PdfReader(path)
        for page in reader.pages:
            if extracted := page.extract_text():
                text += extracted + "\n"
        os.unlink(path)

    elif ext == ".docx":
        path = save_temp_file(contents, ".docx")
        doc = Document(path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        os.unlink(path)

    else:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Formato não suportado")

    prompt = f"""
Analise o conteúdo abaixo e gere:
- resumo
- tópicos principais
- sugestões de aula
- atividade escolar

Conteúdo:
{text}
"""
    response_text = generate_ai_response(prompt)
    return {"content": text[:5000], "analysis": response_text}


@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    validate_file(file.filename, len(contents))

    path = save_temp_file(contents, ".pdf")
    reader = PdfReader(path)
    text = "".join(page.extract_text() or "" for page in reader.pages)
    os.unlink(path)

    response = generate_ai_response(f"""
Leia o conteúdo abaixo e crie um resumo pedagógico:

{text[:12000]}
""")
    return {"filename": file.filename, "summary": response}


@router.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    contents = await file.read()
    validate_file(file.filename, len(contents))

    path = save_temp_file(contents, os.path.splitext(file.filename)[1])
    image = Image.open(path)
    extracted_text = pytesseract.image_to_string(image, lang="por")
    os.unlink(path)

    prompt = f"""
Analise o texto abaixo.
Crie:
- resumo
- explicação
- atividade escolar
- perguntas

Texto:
{extracted_text}
"""
    response_text = generate_ai_response(prompt)
    return {"text": extracted_text, "analysis": response_text}


@router.post("/generate-lesson")
def generate_lesson(data: LessonRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

    if user.plan == "free" and user.credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Limite diário atingido. Faça upgrade para PRO."
        )

    if user.plan == "free" and user.role != "admin":
        user.credits -= 1

    content = generate_lesson_plan(data.grade, data.subject, data.bimester, data.topic, data.hours)

    lesson = Lesson(
        email=data.email,
        grade=data.grade,
        subject=data.subject,
        bimester=data.bimester,
        topic=data.topic,
        hours=data.hours,
        content=content,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return {
        "id": lesson.id,
        "content": content,
        "credits": user.credits,
    }


@router.get("/lessons")
def list_lessons(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

    lessons = db.query(Lesson).filter(Lesson.email == email).order_by(Lesson.created_at.desc()).all()

    return [
        {
            "id": l.id,
            "grade": l.grade,
            "subject": l.subject,
            "bimester": l.bimester,
            "topic": l.topic,
            "hours": l.hours,
            "content": l.content,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        }
        for l in lessons
    ]

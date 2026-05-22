FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV HOST=0.0.0.0
ENV PORT=7860
ENV CORS_ORIGINS=*
ENV RATE_LIMIT_PER_MINUTE=60
ENV TESSERACT_CMD=/usr/bin/tesseract

ENV DATABASE_URL=sqlite:////data/nexusedu.db

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]

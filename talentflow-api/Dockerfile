FROM python:3.11-slim

# Instala o binario oficial do uv (Astral)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/

WORKDIR /app

# Dependencias do sistema necessarias para PyMuPDF e pdfplumber
RUN apt-get update && apt-get install -y \
    libmupdf-dev \
    mupdf-tools \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml requirements.txt ./
RUN uv pip install --system --no-cache -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

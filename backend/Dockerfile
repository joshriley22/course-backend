FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copied into ./backend/ (not ./) so the "backend.*" imports used throughout
# this package (e.g. `from backend.routers import course_router`) resolve
# correctly when run from WORKDIR /app.
COPY . ./backend/

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
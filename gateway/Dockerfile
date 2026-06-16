FROM python:3.11-slim
WORKDIR /app
COPY shared/ ./shared/
COPY gateway/requirements.txt ./gateway/requirements.txt
RUN pip install --no-cache-dir -r gateway/requirements.txt
COPY gateway/ ./gateway/
EXPOSE 8080
CMD ["uvicorn", "gateway.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]

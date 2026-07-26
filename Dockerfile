# Один образ: Fastify-бэкенд отдаёт API и собранный фронтенд.
# Приложение слушает порт из переменной окружения PORT (по умолчанию 5001).

# --- Сборка фронтенда ------------------------------------------------------
FROM node:22-alpine AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Сборка зависимостей бэкенда (нужен toolchain для better-sqlite3) ------
FROM node:22-alpine AS backend-deps
RUN apk add --no-cache python3 make g++
WORKDIR /build/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# --- Продакшен-образ -------------------------------------------------------
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=backend-deps /build/backend/node_modules backend/node_modules
COPY backend/package.json backend/package-lock.json backend/

# Контракт нужен бэкенду в рантайме: из него загружаются схемы валидации
COPY docs/api/openapi.yaml docs/api/openapi.yaml
COPY backend/src backend/src
COPY --from=frontend /build/frontend/dist public

ENV STATIC_DIR=/app/public
# SQLite-файл по умолчанию; на Render/Volumes переопределите DATABASE_PATH
ENV DATABASE_PATH=/app/data/call-calendar.db
RUN mkdir -p /app/data

EXPOSE 5001

CMD ["node", "backend/src/index.js"]

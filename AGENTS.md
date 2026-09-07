# Правила работы с репозиторием (для людей и ИИ-агентов)

## Подход: Design First

Источник истины — TypeSpec-контракт в `spec/`. Любое изменение API начинается
с правки `.tsp`-файлов, затем:

1. `npm run spec:build` — пересобрать `docs/api/openapi.yaml` (руками не редактируется);
2. `cd frontend && npm run api:types` — обновить типы клиента.

Бэкенд и фронтенд опираются только на контракт: бэкенд валидирует запросы
схемами из `openapi.yaml`, фронтенд ходит в API только через типизированный
клиент `frontend/src/api/client.ts`.

## Формат коммитов: Conventional Commits

Все коммиты (включая сделанные агентами) следуют
[Conventional Commits](https://www.conventionalcommits.org/ru/v1.0.0/) —
по ним release-please автоматически формирует changelog и версию.

Формат: `тип(область): описание` — описание на русском, в повелительном
наклонении, без точки в конце.

Типы и их влияние на версию:

- `feat:` — новая функциональность (minor);
- `fix:` — исправление ошибки (patch);
- `feat!:` / `fix!:` или футер `BREAKING CHANGE:` — несовместимое изменение (major);
- `docs:`, `test:`, `ci:`, `chore:`, `refactor:` — не попадают в версию,
  но допустимы и желательны для непродуктовых изменений.

Области (scope), принятые в проекте: `spec`, `backend`, `frontend`, `e2e`, `ci`, `docs`.

Примеры:

```text
feat(spec): добавить отмену брони гостем по секретной ссылке
feat(frontend): страница настройки доступности владельца
fix(backend): учитывать таймзону владельца при проверке слота
test(e2e): сценарий конфликта бронирования
ci: запуск e2e в GitHub Actions
```

Правила для агентов:

- один коммит — одно логическое изменение;
- если правка затрагивает контракт и реализацию, коммитить вместе с
  пересобранными `docs/api/openapi.yaml` и типами клиента (`ci` проверяет
  их актуальность);
- не коммитить без явной просьбы владельца репозитория.

## Запуск приложения локально

Корень (один раз): `npm install` — TypeSpec + Prism.

```bash
# Терминал 1 — API (порт 5001)
cd backend && npm install && npm start
# или с автоперезапуском: npm run dev
# переменные (опционально): PORT, OWNER_EMAIL, OWNER_PASSWORD, OWNER_NAME,
# OWNER_SLUG, OWNER_TIMEZONE, DATABASE_PATH, PUBLIC_BASE_URL

# Терминал 2 — UI (порт 5173, /api проксируется на 5001)
cd frontend && npm install && npm run dev
# API_PROXY_TARGET=http://localhost:5001 — если бэкенд на другом адресе
```

UI: http://localhost:5173 · публичная страница сида: `/u/kirill` · вход по умолчанию `owner@example.com` / `secret`.

Вместо бэкенда для работы только над фронтом: из корня `npm run api:mock` (Prism на 5001).

## Проверки перед коммитом

- `cd backend && npm test` — бизнес-правила API;
- `cd frontend && npm run lint && npm run build` — линт и типы фронтенда;
- `cd e2e && npm test` — интеграционные сценарии (нужен установленный
  Chromium: `npx playwright install chromium`).

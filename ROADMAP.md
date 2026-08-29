# ROADMAP — Call Calendar (AI version)

План развития проекта. Каждый пункт — кандидат в issue для работы агента
(issue → triage → PR → ревью), см. задачи проекта в [README](./README.md).

## Отправная точка (актуально на 29.08.2026)

Продуктовая кодовая база синхронизирована с
[fullstack-javascript-project-386 / sprint11](https://github.com/kirillchistov/fullstack-javascript-project-386/tree/sprint11)
(шаги 7–10): регистрация и публичные `/u/{slug}`, типы встреч, SQLite,
таймзоны, кастомное расписание, буферы, гостевое управление бронью,
уведомления, busy-sync, команды, серии, аналитика, платные встречи, freemium.

Поверх продукта сохранены агентные workflow этого репозитория:
`opencode.yml`, `lighthouse-nightly.yml`.

Проверено локально после переноса:

- `npm run spec:build` — контракт компилируется;
- `cd backend && npm test` — 22/22;
- `cd frontend && npm run lint && npm run build` — линт (warnings) и сборка ок.

Все изменения API — через Design First (AGENTS.md): сначала `spec/`, затем
`spec:build`, типы клиента и реализация.

---

## Уже в продукте (из sprint11)

- [x] Регистрация / аккаунты, публичная ссылка `/u/:slug`, несколько типов встреч
- [x] SQLite, таймзоны, горизонт бронирования 14 дней
- [x] Кастомное расписание, буфер, гостевой manage-token
- [x] Уведомления (email/Telegram dry-run без ключей)
- [x] Busy-sync (Google OAuth / stub + ICS), команды, серии, аналитика
- [x] Платные встречи (YooKassa / stub), freemium free/pro
- [x] CT Playwright + e2e, commitlint, release-please
- [x] Агентный процесс: issue/PR/schedule (см. README → Аудит)

## Дальше (кандидаты в issues)

- [ ] **feat: каталог экспертов с доменами специализации** (маркетинг, финансы, IT…)
  — поверх уже многоаккаунтной модели владельцев
- [ ] **fix(frontend): правки по ночным Lighthouse-отчётам**
  — code-splitting, контраст, `aria-label`, meta description
- [ ] **feat(deploy): Persistent Disk для SQLite на Render**
- [ ] **docs: актуализировать how-it-works / project-spec** под 387 и sprint11
- [ ] **ci: scheduled Lighthouse** уже работает; при желании — снова подключить
  агентный разбор отчёта без git-identity regression

Правила коммитов и проверки перед коммитом — в [AGENTS.md](./AGENTS.md).

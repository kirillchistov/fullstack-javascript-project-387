### Hexlet tests and linter status:
[![Actions Status](https://github.com/kirillchistov/fullstack-javascript-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kirillchistov/fullstack-javascript-project-387/actions)

## Call Calendar (AI version)

- «Запись на звонок» - базовый продукт уже реализован: сервис бронирования слотов по мотивам Cal.com. В этом продолжении мы не расширяем продуктовую функциональность, а добавляем организационную обвязку: — сервис бронирования времени по мотивам [Cal.com](https://cal.com/) (сервиса, где пользователь публикует доступные интервалы, а другой человек выбирает свободное время и бронирует встречу).
- [Репозиторий проекта](https://github.com/kirillchistov/fullstack-javascript-project-387)
- [Демо на GitHub Pages](https://kirillchistov.github.io/fullstack-javascript-project-386/) — упрощённая версия: API эмулируется прямо в браузере (слоты вычисляются из правил доступности, брони живут в localStorage). Для входа владельца подойдут любые email и пароль.
- Деплой автоматический: workflow [deploy-pages.yml](./.github/workflows/deploy-pages.yml) собирает `npm run build:demo` при пуше в `main` (в настройках репозитория Pages должен быть переключён на «GitHub Actions»).
- [Полное приложение на Render](https://call-calendar-onli.onrender.com/)
- Проект учит, как использовать агента как участника командного процесса, а не только как локального помощника в IDE/CLI.

## Задачи этого проекта:
- Настройка OpenCode GitHub App.
- Работа с issue через комментарии.
- Создание и доработка PR агентом.
- Регулярные ночные проверки (например, Lighthouse) через schedule workflow.

## Что должно получиться
В репозитории должны появиться рабочие GitHub Actions и артефакты процесса:
- Ответ агента в issue.
- Пример triage/разбора задачи.
- PR с правками от агента и доработками после ревью.
- Scheduled workflow с отчетом по регулярной проверке.

## Шаг 1:
[x] Перенести код из предыдущего проекта в этот репозиторий.
[x] Составь план разботки: новые фичи, баги, которые будем исправлять в [ROADMAP.md](./ROADMAP.md).

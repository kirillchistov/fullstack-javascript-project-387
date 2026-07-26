### Hexlet tests and linter status:
[![Actions Status](https://github.com/kirillchistov/fullstack-javascript-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kirillchistov/fullstack-javascript-project-387/actions)

## Call Calendar (AI version)

- «Запись на звонок» - базовый продукт уже реализован: сервис бронирования слотов по мотивам Cal.com. В этом продолжении мы не расширяем продуктовую функциональность, а добавляем организационную обвязку: — сервис бронирования времени по мотивам [Cal.com](https://cal.com/) (сервиса, где пользователь публикует доступные интервалы, а другой человек выбирает свободное время и бронирует встречу).
- [Репозиторий проекта](https://github.com/kirillchistov/fullstack-javascript-project-387)
- [Демо на GitHub Pages](https://kirillchistov.github.io/fullstack-javascript-project-387/) — упрощённая версия: API эмулируется прямо в браузере (слоты вычисляются из правил доступности, брони живут в localStorage). Для входа владельца подойдут любые email и пароль.
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

## Шаг 6: устойчивость агентного процесса

Аудит (26.07.2026). Run-ы смотреть здесь: [Actions → opencode](https://github.com/kirillchistov/fullstack-javascript-project-387/actions/workflows/opencode.yml), [Actions → lighthouse-nightly](https://github.com/kirillchistov/fullstack-javascript-project-387/actions/workflows/lighthouse-nightly.yml).

### Триггеры
- [x] Агент запускается только на `/oc` и `/opencode` (`if` в [opencode.yml](./.github/workflows/opencode.yml)).
- [x] Нет запусков на каждый комментарий: за всё время 8 run-ов opencode — только на наши целевые комментарии (explain / fix / review).
- [x] Защита от ботов: `github.event.comment.user.type != 'Bot'` — ответы `github-actions[bot]` не перезапускают workflow.

### Permissions (минимум под задачу)
| Workflow | Права | Оценка |
|---|---|---|
| `opencode.yml` | `contents/pull-requests/issues: write`, `id-token: write` | нужно для веток, PR и комментариев |
| `lighthouse-nightly.yml` | `contents: read`, `issues: write`, `id-token: write` | без лишнего write в код |
| `deploy-pages.yml` | `contents: read`, `pages/id-token: write` | только деплой Pages |
| `release-please.yml` | `contents/pull-requests: write` | создание release-PR и тегов |
| `ci.yml` | дефолт (read) | без write |

### Контроль расходов
- [x] Schedule: 1 раз/сутки (`30 3 * * *`, 06:30 МСК) + `workflow_dispatch`.
- [x] Модель везде `opencode/big-pickle` (бесплатная Zen); платный ключ опционален.
- [x] Где смотреть run-ы — ссылки выше.

### Сценарии, которые уже отрабатывали
- [x] Вызов в issue: [#1](https://github.com/kirillchistov/fullstack-javascript-project-387/issues/1), triage [#2](https://github.com/kirillchistov/fullstack-javascript-project-387/issues/2).
- [x] PR и ревью: [#10](https://github.com/kirillchistov/fullstack-javascript-project-387/pull/10) (создание + правки по общему и построчному `/oc`).
- [x] Scheduled-workflow: [lighthouse-nightly](https://github.com/kirillchistov/fullstack-javascript-project-387/actions/workflows/lighthouse-nightly.yml) (проверен вручную; cron настроен), отчёт [#14](https://github.com/kirillchistov/fullstack-javascript-project-387/issues/14).

### Самооценка эффективности агента

| Сценарий | Итерации | Итог |
|---|---|---|
| `/oc explain` в тестовом issue #1 | 1 (после настройки workflow) | С первого прохода |
| Triage расплывчатого issue #2 | 1 | С первого прохода — точный разбор in-memory store |
| `/oc fix` → PR #10 | 2 | 1-й раз упал на `persist-credentials`; 2-й — PR готов |
| Ревью PR (общий + построчный `/oc`) | 1+1 | Оба замечания с первого прохода |
| Lighthouse nightly + issue | 1 (+ мелкий фикс git identity) | Отчёт и issue созданы; job формально упал на git |

**Итог:** из 5 продуктовых сценариев 3 решены с первого прохода агента, 2 потребовали доработки инфраструктуры (креды git, identity) — не логики задачи. Признак хороший: где задача сформулирована ясно, агент справляется с первого раза; итерации уходили на обвязку CI.

## Шаг 6:
- [x] Перепроверь триггеры workflow:
-- Агент запускается только на целевые команды.
-- Нет запусков на каждый комментарий подряд.
-- Есть защита от самозапуска и реакции на сообщения ботов.
- [x] Перепроверь permissions:
-- У каждого workflow только минимально необходимые права.
-- Нет избыточных write-разрешений.
- [x] Перепроверь контроль расходов:
-- Разумная частота schedule.
-- Модель выбирается под задачу (где можно — более дешевая).
-- Понятно, где смотреть run-ы в GitHub Actions.
- [x] Убедись, что вы ранее поработи с агентом в GitHub:
-- Вызвали агента в issue.
-- Агент создал PR или выполнил ревью кода.
-- Хотя бы один запуск scheduled workflow.
- [x] Сделай короткую самооценку эффективности работы с агентом:
-- Отметьте для себя, сколько задач решилось с первого прохода.
-- Выделите задачи, где потребовалось несколько итераций.
-- Хороший признак, если задач, решенных с первого раза, больше.

## Шаг 5:
- [x] Добавь повторяющуюся задачу с запуском по расписанию.
- [x] Добавь возможность запускать ту же задачу вручную.
- [x] Настрой запуск Lighthouse CLI и генерацию отчета.
- [x] Убедись, что отчет сохраняется и его можно посмотреть утром.
- [x] По итогам отчета фиксируй, какие правки нужны в проекте. Результат: [ночной Lighthouse-отчёт](https://github.com/kirillchistov/fullstack-javascript-project-387/issues/14), [запуск с артефактом](https://github.com/kirillchistov/fullstack-javascript-project-387/actions/runs/30188423618).

## Шаг 4: 
- [x] В том же issue попроси агента подготовить PR с исправлением (если PR еще не создан).
- [x] Проверь PR: описание, изменения, связь с issue.
- [x] Оставь два вида замечаний: 1)общий комментарий в обсуждении PR; 2) комментарий к конкретной строке в diff.
- [x] Добавь /oc в комментарии и попроси агента внести правки.
- [x] Проверь, что агент обновил PR и учел оба типа обратной связи.
- [x] Убедись, что коммиты агента в PR оформлены по Conventional Commits (feat:, fix: и так далее).
- [x] Смёрджи PR и проверь, что release-please создал или обновил release-PR с changelog и предложенной версией.

## Шаг 3:
- [x] Создай issue с расплывчатым описанием проблемы в календарном приложении.
- [x] Добавь комментарий с командой /oc explain и попросите агента разобрать проблему.
- [x] Если разбор полезный, попросит следующий шаг: предложить план исправления или сразу подготовить fix через /oc fix.
- [x] Сравни, насколько ответ агента помог уточнить задачу: причины, затронутые части кода, ожидаемый путь решения. Результат: [Issue прошел через triage с участием агента, и из нечеткого описания получилась рабочая техническая постановка](https://github.com/kirillchistov/fullstack-javascript-project-387/issues/2).

## Шаг 2:
- [x] Выполни GitHub App с агентом в репозиторий и настрой его.
- [x] Создай тестовый issue и вызови агента через комментарий /oc explain this issue.
- [x] Подключи OpenCode к репозиторию и подтверди [рабочий сценарий вызова агента из issue](https://github.com/kirillchistov/fullstack-javascript-project-387/issues/1).


## Шаг 1:
- [x] Перенеси код из предыдущего проекта в этот репозиторий.
- [x] Составь план разботки: новые фичи, баги, которые будем исправлять в [ROADMAP.md](./ROADMAP.md).

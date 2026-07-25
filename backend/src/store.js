import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

/**
 * Персистентное хранилище на better-sqlite3.
 * Интерфейс совпадает с прежним in-memory store,
 * поэтому app.js и slots.js не требуют изменений.
 */
export function createStore() {
  const isTest = process.env.NODE_ENV === 'test';
  const dbPath = isTest
    ? ':memory:'
    : process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'call-calendar.db');

  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS owner (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS event_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      duration_minutes INTEGER NOT NULL DEFAULT 30
    );
    CREATE TABLE IF NOT EXISTS availability (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      timezone TEXT NOT NULL DEFAULT 'Europe/Moscow'
    );
    CREATE TABLE IF NOT EXISTS availability_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      weekday INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      event_type_id INTEGER NOT NULL,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      comment TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY
    );
  `);

  const seedOwner = db.prepare(
    'INSERT OR IGNORE INTO owner (id, name, email, password) VALUES (1, ?, ?, ?)',
  );
  seedOwner.run(
    process.env.OWNER_NAME ?? 'Кирилл Чистов',
    process.env.OWNER_EMAIL ?? 'owner@example.com',
    process.env.OWNER_PASSWORD ?? 'secret',
  );

  const hasEventTypes = db.prepare('SELECT count(*) AS n FROM event_types').get();
  if (hasEventTypes.n === 0) {
    const ins = db.prepare(
      'INSERT INTO event_types (name, description, duration_minutes) VALUES (?, ?, ?)',
    );
    ins.run('Вводный звонок', 'Знакомство и обсуждение задачи', 30);
    ins.run('Консультация', 'Разбор вопросов по проекту', 30);
  }

  const hasAvailability = db.prepare('SELECT count(*) AS n FROM availability').get();
  if (hasAvailability.n === 0) {
    db.prepare('INSERT INTO availability (id, timezone) VALUES (1, ?)').run(
      process.env.OWNER_TIMEZONE ?? 'Europe/Moscow',
    );
    const insRule = db.prepare(
      'INSERT INTO availability_rules (weekday, start_time, end_time) VALUES (?, ?, ?)',
    );
    for (const weekday of [1, 2, 3, 4, 5]) {
      insRule.run(weekday, '10:00', '18:00');
    }
  }

  return {
    get owner() {
      const row = db.prepare('SELECT id, name, email FROM owner WHERE id = 1').get();
      return { id: row.id, name: row.name, email: row.email };
    },

    checkCredentials(email, password) {
      const row = db.prepare('SELECT password FROM owner WHERE id = 1').get();
      return row && email === db.prepare('SELECT email FROM owner WHERE id = 1').get().email &&
        password === row.password;
    },

    createSession() {
      const token = crypto.randomUUID();
      db.prepare('INSERT INTO sessions (token) VALUES (?)').run(token);
      return token;
    },
    hasSession(token) {
      if (!token) return false;
      const row = db.prepare('SELECT 1 FROM sessions WHERE token = ?').get(token);
      return Boolean(row);
    },
    destroySession(token) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    },

    getEventTypes() {
      return db
        .prepare('SELECT id, name, description, duration_minutes AS durationMinutes FROM event_types')
        .all();
    },
    findEventType(id) {
      const row = db
        .prepare('SELECT id, name, description, duration_minutes AS durationMinutes FROM event_types WHERE id = ?')
        .get(id);
      return row ?? null;
    },

    getAvailability() {
      const avail = db.prepare('SELECT timezone FROM availability WHERE id = 1').get();
      const rules = db
        .prepare('SELECT weekday, start_time AS startTime, end_time AS endTime FROM availability_rules ORDER BY weekday')
        .all();
      return { timezone: avail.timezone, rules };
    },
    setAvailability({ timezone, rules }) {
      const replace = db.transaction(() => {
        db.prepare('UPDATE availability SET timezone = ? WHERE id = 1').run(timezone);
        db.prepare('DELETE FROM availability_rules').run();
        const ins = db.prepare(
          'INSERT INTO availability_rules (weekday, start_time, end_time) VALUES (?, ?, ?)',
        );
        for (const rule of rules) {
          ins.run(rule.weekday, rule.startTime, rule.endTime);
        }
      });
      replace();
      return this.getAvailability();
    },

    getBookings() {
      return db
        .prepare(
          'SELECT id, status, created_at AS createdAt, event_type_id AS eventTypeId, starts_at AS startsAt, ends_at AS endsAt, guest_name AS guestName, guest_email AS guestEmail, comment FROM bookings',
        )
        .all();
    },
    getActiveBookings() {
      return db
        .prepare(
          "SELECT id, status, created_at AS createdAt, event_type_id AS eventTypeId, starts_at AS startsAt, ends_at AS endsAt, guest_name AS guestName, guest_email AS guestEmail, comment FROM bookings WHERE status = 'active'",
        )
        .all();
    },
    findActiveBooking(id) {
      const row = db
        .prepare(
          "SELECT id, status, created_at AS createdAt, event_type_id AS eventTypeId, starts_at AS startsAt, ends_at AS endsAt, guest_name AS guestName, guest_email AS guestEmail, comment FROM bookings WHERE id = ? AND status = 'active'",
        )
        .get(id);
      return row ?? null;
    },
    createBooking({ eventTypeId, startsAt, endsAt, guestName, guestEmail, comment }) {
      const createdAt = new Date().toISOString();
      const result = db.prepare(
        'INSERT INTO bookings (status, created_at, event_type_id, starts_at, ends_at, guest_name, guest_email, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ).run('active', createdAt, eventTypeId, startsAt, endsAt, guestName, guestEmail, comment ?? null);
      const id = Number(result.lastInsertRowid);
      return { id, status: 'active', createdAt, eventTypeId, startsAt, endsAt, guestName, guestEmail, ...(comment !== undefined && { comment }) };
    },
    cancelBooking(booking) {
      db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(booking.id);
    },
  };
}

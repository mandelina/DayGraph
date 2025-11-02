import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'

// 단일 DB 인스턴스 제공
let _db: ReturnType<typeof drizzle> | null = null

export function getDB() {
  if (_db) return _db

  const datadir = process.env.DATADIR ? resolve(process.env.DATADIR) : resolve(process.cwd(), 'data')
  mkdirSync(datadir, { recursive: true })

  const file = join(datadir, 'dev-activity.sqlite')
  // better-sqlite3는 네이티브 모듈이므로 Electron ABI에 맞춰 rebuild 필요
  // import 시점 크래시를 막기 위해 지연 로딩(require)로 전환
  const require = createRequire(import.meta.url)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Database: any = require('better-sqlite3')
  const sqlite = new Database(file)
  sqlite.pragma('journal_mode = WAL') // 성능/안정: WAL 모드

  _db = drizzle(sqlite)
  // 스키마 보장: 테이블 생성 (최초 1회)
  sqlite.exec(`CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    app_name TEXT NOT NULL,
    window_title TEXT NOT NULL,
    display_id INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    clicks INTEGER NOT NULL DEFAULT 0,
    keypress INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`)
  return _db
}

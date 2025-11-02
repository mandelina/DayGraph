import { getDB } from './index'
import { activityLog } from './schema'
import { sql } from 'drizzle-orm'

// 1초 1회 insert를 위한 헬퍼
export function insertActivity(entry: {
  timestamp: string
  app_name: string
  window_title: string
  display_id: number | null
  is_active: boolean
  clicks: number
  keypress: number
}) {
  const db = getDB()
  const createdAt = new Date().toISOString()
  return db.insert(activityLog).values({ ...entry, created_at: createdAt }).run()
}

// YYYY-MM-DD 기준으로 당일 데이터 조회
export function queryDay(dateISO: string) {
  const db = getDB()
  const start = `${dateISO}T00:00:00.000Z`
  const end = `${dateISO}T23:59:59.999Z`
  return db
    .select()
    .from(activityLog)
    .where(sql`${activityLog.timestamp} BETWEEN ${start} AND ${end}`)
    .orderBy(activityLog.timestamp)
    .all()
}

// 스키마 생성은 getDB 내부에서 1회 수행하도록 이동

import { getDB } from './index'
import { activityLog } from './schema'
import { sql } from 'drizzle-orm'

// 1초 1회 insert를 위한 헬퍼
export function insertActivity(entry: {
  timestamp: string
  app_name: string
  app_path?: string | null
  bundle_id?: string | null
  window_title: string
  display_id: number | null
  is_active: boolean
  clicks: number
  keypress: number
}) {
  const db = getDB()
  const createdAt = new Date().toISOString()
  return db
    .insert(activityLog)
    .values({
      ...entry,
      app_path: entry.app_path ?? null,
      bundle_id: entry.bundle_id ?? null,
      created_at: createdAt
    })
    .run()
}

// YYYY-MM-DD 기준으로 당일 데이터 조회
export function queryDay(dateISO: string) {
  const db = getDB()
  const { start, end } = getLocalDayRange(dateISO)
  return db
    .select()
    .from(activityLog)
    .where(sql`${activityLog.timestamp} >= ${start} AND ${activityLog.timestamp} < ${end}`)
    .orderBy(activityLog.timestamp)
    .all()
}

// 사용자가 보는 로컬 날짜 기준으로 UTC 저장 timestamp 범위를 계산한다.
export function getLocalDayRange(dateISO: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    throw new Error(`invalid dateISO: ${dateISO}`)
  }
  const [year, month, day] = dateISO.split('-').map(Number)
  const startLocal = new Date(year, month - 1, day, 0, 0, 0, 0)
  if (
    startLocal.getFullYear() !== year ||
    startLocal.getMonth() !== month - 1 ||
    startLocal.getDate() !== day
  ) {
    throw new Error(`invalid dateISO: ${dateISO}`)
  }
  const endLocal = new Date(year, month - 1, day + 1, 0, 0, 0, 0)
  return {
    start: startLocal.toISOString(),
    end: endLocal.toISOString()
  }
}

// 스키마 생성은 getDB 내부에서 1회 수행하도록 이동

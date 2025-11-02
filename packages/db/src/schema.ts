import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// activity_log 스키마 (요구 사항 요약 반영)
export const activityLog = sqliteTable('activity_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: text('timestamp').notNull(), // ISO string
  app_name: text('app_name').notNull(),
  window_title: text('window_title').notNull(),
  display_id: integer('display_id'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  clicks: integer('clicks').notNull().default(0),
  keypress: integer('keypress').notNull().default(0),
  created_at: text('created_at').notNull()
})

export type ActivityLog = typeof activityLog.$inferSelect


// IPC 채널과 페이로드 타입을 한 곳에서 정의하여 main/preload/renderer가 공유
export const IPC = {
  channels: {
    queryDay: 'daygraph:query-day'
  }
} as const

export type QueryDayRequest = string // date ISO (YYYY-MM-DD)
export type QueryDayResponse = Array<{
  timestamp: string
  app_name: string
  window_title: string
  display_id: number | null
  is_active: boolean
  clicks: number
  keypress: number
  created_at: string
}>


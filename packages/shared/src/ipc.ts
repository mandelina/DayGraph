// IPC 채널과 페이로드 타입을 한 곳에서 정의하여 main/preload/renderer가 공유
export const IPC = {
  channels: {
    queryDay: 'daygraph:query-day',
    getAppIcon: 'daygraph:get-app-icon',
    getCollectorStatus: 'daygraph:get-collector-status'
  }
} as const

export type QueryDayRequest = string // date ISO (YYYY-MM-DD)
export type QueryDayResponse = Array<{
  timestamp: string
  app_name: string
  app_path: string | null
  bundle_id: string | null
  window_title: string
  display_id: number | null
  is_active: boolean
  clicks: number
  keypress: number
  created_at: string
}>

export type GetAppIconRequest = {
  appPath?: string | null
  bundleId?: string | null
}
export type GetAppIconResponse = string | null

export type CollectorStatusResponse = {
  ok: boolean
  reachable: boolean
  url: string
  platform: string | null
  inputBackend: string | null
  inputBackendError: string | null
  pid: number | null
  uptimeSeconds: number | null
  timestamp: string
  error: string | null
}

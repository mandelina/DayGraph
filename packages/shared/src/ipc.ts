// IPC 채널과 페이로드 타입을 한 곳에서 정의하여 main/preload/renderer가 공유
export const IPC = {
  channels: {
    queryDay: 'daygraph:query-day',
    queryRange: 'daygraph:query-range',
    getAppIcon: 'daygraph:get-app-icon',
    getCollectorStatus: 'daygraph:get-collector-status',
    openDataDir: 'daygraph:open-data-dir',
    queryRangeSummary: 'daygraph:query-range-summary'
  }
} as const

export type QueryDayRequest = string // date ISO (YYYY-MM-DD)
export type ActivityRow = {
  id: number
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
}

export type QueryDayResponse = ActivityRow[]
export type QueryRangeRequest = {
  startDateISO: string
  endDateISO: string
}
export type QueryRangeResponse = ActivityRow[]

export type ActivitySummaryAppRow = {
  dateISO: string
  appName: string
  appPath: string | null
  bundleId: string | null
  totalRows: number
  activeSeconds: number
  inputSeconds: number
  clickCount: number
  keypressCount: number
}

export type ActivitySummaryDayRow = {
  dateISO: string
  totalRows: number
  activeSeconds: number
  inputSeconds: number
  appSwitches: number
}

export type QueryRangeSummaryResponse = {
  apps: ActivitySummaryAppRow[]
  days: ActivitySummaryDayRow[]
}

export type GetAppIconRequest = {
  appPath?: string | null
  bundleId?: string | null
}
export type GetAppIconResponse = string | null

export type CollectorStatusResponse = {
  ok: boolean
  status: 'healthy' | 'degraded'
  reachable: boolean
  url: string
  dataDir: string | null
  dataQuality: 'real' | 'unavailable'
  activeWindowBackend: string | null
  activeWindowBackendError: string | null
  platform: string | null
  inputBackend: string | null
  inputBackendError: string | null
  displayBackend: string | null
  displayBackendError: string | null
  pid: number | null
  uptimeSeconds: number | null
  tickRunning: boolean
  skippedTicks: number
  lastTickAt: string | null
  lastTickDurationMs: number | null
  lastTickError: string | null
  timestamp: string
  error: string | null
}

export type OpenDataDirResponse = {
  ok: boolean
  error: string | null
}

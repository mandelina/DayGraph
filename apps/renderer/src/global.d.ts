export {}
import type {
  QueryDayResponse,
  GetAppIconResponse,
  GetAppIconRequest,
  CollectorStatusResponse,
} from "@daygraph/shared/ipc"

declare global {
  interface Window {
    api?: {
      queryDay: (dateISO: string) => Promise<QueryDayResponse>
      getAppIcon: (payload: GetAppIconRequest) => Promise<GetAppIconResponse>
      getCollectorStatus: () => Promise<CollectorStatusResponse>
    }
  }
}

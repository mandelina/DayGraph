export {}
import type {
  QueryDayResponse,
  GetAppIconResponse,
  GetAppIconRequest,
} from "@daygraph/shared/ipc"

declare global {
  interface Window {
    api: {
      queryDay: (dateISO: string) => Promise<QueryDayResponse>
      getAppIcon: (payload: GetAppIconRequest) => Promise<GetAppIconResponse>
    }
  }
}

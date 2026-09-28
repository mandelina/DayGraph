export {}
import type {
  QueryDayResponse,
  QueryRangeResponse,
  GetAppIconResponse,
  GetAppIconRequest,
  CollectorStatusResponse,
  OpenDataDirResponse,
  QueryRangeSummaryResponse,
} from "@daygraph/shared/ipc"

declare global {
  interface Window {
    api?: {
      queryDay: (dateISO: string) => Promise<QueryDayResponse>
      queryRange: (startDateISO: string, endDateISO: string) => Promise<QueryRangeResponse>
      getAppIcon: (payload: GetAppIconRequest) => Promise<GetAppIconResponse>
      getCollectorStatus: () => Promise<CollectorStatusResponse>
      openDataDir: () => Promise<OpenDataDirResponse>
      queryRangeSummary: (
        startDateISO: string,
        endDateISO: string,
      ) => Promise<QueryRangeSummaryResponse>
    }
  }
}

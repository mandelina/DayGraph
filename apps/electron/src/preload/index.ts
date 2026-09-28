import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '@daygraph/shared/ipc'

// Renderer에서 window.api.queryDay(dateISO) 사용 가능하도록 노출
contextBridge.exposeInMainWorld('api', {
  queryDay: (dateISO: string) => ipcRenderer.invoke(IPC.channels.queryDay, dateISO),
  queryRange: (startDateISO: string, endDateISO: string) =>
    ipcRenderer.invoke(IPC.channels.queryRange, startDateISO, endDateISO),
  getAppIcon: (payload: { appPath?: string | null; bundleId?: string | null }) =>
    ipcRenderer.invoke(IPC.channels.getAppIcon, payload),
  getCollectorStatus: () => ipcRenderer.invoke(IPC.channels.getCollectorStatus),
  openDataDir: () => ipcRenderer.invoke(IPC.channels.openDataDir),
  queryRangeSummary: (startDateISO: string, endDateISO: string) =>
    ipcRenderer.invoke(IPC.channels.queryRangeSummary, startDateISO, endDateISO),
})

// 타입 선언을 위해 글로벌 보강(JSDoc)
declare global {
  interface Window {
    api?: {
      queryDay: (dateISO: string) => Promise<unknown>
      queryRange: (startDateISO: string, endDateISO: string) => Promise<unknown>
      getAppIcon: (payload: { appPath?: string | null; bundleId?: string | null }) => Promise<unknown>
      getCollectorStatus: () => Promise<unknown>
      openDataDir: () => Promise<unknown>
      queryRangeSummary: (startDateISO: string, endDateISO: string) => Promise<unknown>
    }
  }
}

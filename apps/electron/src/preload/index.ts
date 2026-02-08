import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '@daygraph/shared/ipc'

// Renderer에서 window.api.queryDay(dateISO) 사용 가능하도록 노출
contextBridge.exposeInMainWorld('api', {
  queryDay: (dateISO: string) => ipcRenderer.invoke(IPC.channels.queryDay, dateISO),
  getAppIcon: (payload: { appPath?: string | null; bundleId?: string | null }) =>
    ipcRenderer.invoke(IPC.channels.getAppIcon, payload)
})

// 타입 선언을 위해 글로벌 보강(JSDoc)
declare global {
  interface Window {
    api: {
      queryDay: (dateISO: string) => Promise<unknown>
      getAppIcon: (payload: { appPath?: string | null; bundleId?: string | null }) => Promise<unknown>
    }
  }
}

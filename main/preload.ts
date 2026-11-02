import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { PocketPokeBridge } from "../shared/ipc"; // type-only, no runtime import

const handler = {
  send<T>(channel: string, value?: T) {
    ipcRenderer.send(channel, value)
  },
  on<T>(channel: string, callback: (...args: T[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: T[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
  getAppVersion(): Promise<string> {
    return ipcRenderer.invoke('app:get-version')
  },
}

// Keep these strings in sync with CHANNELS in shared/ipc.ts
const bridge: PocketPokeBridge = {
  getSwitchStatus: (opts) => ipcRenderer.invoke('pocketPoke:status', opts),
  injectItems: (req) => ipcRenderer.invoke('pocketPoke:inject', req),
};

contextBridge.exposeInMainWorld('ipc', handler);
contextBridge.exposeInMainWorld('pocketPoke', bridge);

export type IpcHandler = typeof handler
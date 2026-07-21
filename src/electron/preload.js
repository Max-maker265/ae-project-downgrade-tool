const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aeTool", {
  status: () => ipcRenderer.invoke("status"),
  pickInput: () => ipcRenderer.invoke("pick-input"),
  pickOutput: (defaultPath) => ipcRenderer.invoke("pick-output", defaultPath),
  convert: (payload) => ipcRenderer.invoke("convert", payload)
});

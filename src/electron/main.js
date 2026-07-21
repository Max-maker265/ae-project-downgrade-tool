const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

let core = null;

function loadCore() {
  if (core) return core;
  const convPath = path.join(__dirname, "converter.js");
  const code = fs.readFileSync(convPath, "utf-8");
  const modified = code.replace(
    /(_0xa3f927\[_0x40c15a\(0x205\)\]=\{[^}]+\});\}\(this\)/,
    "$1;global.__EXP__ = _0xa3f927;}(this)"
  );
  global.Buffer = Buffer;
  eval(modified);
  core = global.__EXP__.AEDowngradeCore;
  return core;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 860,
    minHeight: 620,
    title: "AE工程降级工具",
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  win.removeMenu();
  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle("status", () => ({
  targets: loadCore().targets.map((t) => ({ major: t.major, label: t.label, stability: t.stability }))
}));

ipcMain.handle("pick-input", async () => {
  const result = await dialog.showOpenDialog({
    title: "选择 AE 工程文件",
    filters: [{ name: "AE 文件", extensions: ["aep", "aepx", "ffx"] }],
    properties: ["openFile"]
  });
  return result.canceled ? "" : result.filePaths[0];
});

ipcMain.handle("pick-output", async (_event, defaultPath) => {
  const result = await dialog.showSaveDialog({
    title: "选择转换后的保存位置",
    defaultPath: defaultPath || "降级工程.aep",
    filters: [{ name: "AE 文件", extensions: ["aep", "aepx", "ffx"] }]
  });
  return result.canceled ? "" : result.filePath;
});

ipcMain.handle("convert", (_event, payload) => {
  const inputPath = payload.inputPath;
  const outputPath = payload.outputPath;
  const targetVer = Number(payload.targetVer);

  if (!inputPath || !fs.existsSync(inputPath)) return { ok: false, message: "请选择有效的 AE 文件。" };
  if (!outputPath) return { ok: false, message: "请选择转换后的保存路径。" };

  const target = loadCore().targets.find((t) => t.major === targetVer);
  if (!target) return { ok: false, message: "请选择有效的目标版本。" };

  const detected = loadCore().detectFile(inputPath);
  if (!detected.ok) return { ok: false, message: detected.note || "无法识别文件格式。" };
  if (detected.major <= targetVer) {
    return { ok: false, message: `源版本 AE ${detected.major} 不高于目标版本 AE ${targetVer}，无需降级。` };
  }

  try {
    const result = loadCore().convertFile(inputPath, targetVer);
    if (path.resolve(result.outputPath) !== path.resolve(outputPath)) {
      fs.copyFileSync(result.outputPath, outputPath);
      try { fs.unlinkSync(result.outputPath); } catch {}
    }
    return {
      ok: true,
      message: "转换完成。",
      outputPath,
      sourceMajor: detected.major,
      targetLabel: target.label,
      changes: result.changes
    };
  } catch (error) {
    return { ok: false, message: `转换失败: ${error.message}` };
  }
});

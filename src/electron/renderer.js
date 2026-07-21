const inputPath = document.getElementById("inputPath");
const outputPath = document.getElementById("outputPath");
const targetVer = document.getElementById("targetVer");
const badge = document.getElementById("badge");
const message = document.getElementById("message");

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function defaultOutputName(filePath) {
  if (!filePath) return "";
  const dot = filePath.lastIndexOf(".");
  if (dot < 0) return `${filePath}_降级`;
  return `${filePath.slice(0, dot)}_降级${filePath.slice(dot)}`;
}

async function refresh() {
  const status = await window.aeTool.status();
  badge.textContent = "免费开源";
  badge.className = "badge";
  targetVer.innerHTML = "";
  for (const item of status.targets) {
    const option = document.createElement("option");
    option.value = item.major;
    option.textContent = `${item.label} / AE ${item.major}`;
    targetVer.appendChild(option);
  }
}

document.getElementById("pickInput").addEventListener("click", async () => {
  const picked = await window.aeTool.pickInput();
  if (!picked) return;
  inputPath.value = picked;
  outputPath.value = defaultOutputName(picked);
});

document.getElementById("pickOutput").addEventListener("click", async () => {
  const picked = await window.aeTool.pickOutput(outputPath.value || defaultOutputName(inputPath.value));
  if (picked) outputPath.value = picked;
});

document.getElementById("convert").addEventListener("click", async () => {
  setMessage("正在转换，请稍等...");
  const result = await window.aeTool.convert({
    inputPath: inputPath.value,
    outputPath: outputPath.value,
    targetVer: targetVer.value
  });
  if (result.ok) {
    setMessage(`转换完成。\n输出文件：${result.outputPath}\n源版本：AE ${result.sourceMajor}\n目标版本：${result.targetLabel}\n修改：${result.changes} 处`, "ok");
  } else {
    setMessage(result.message, "err");
  }
});

refresh().catch((error) => setMessage(error.message, "err"));

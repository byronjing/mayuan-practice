#!/bin/zsh

PORT=4173
URL="http://localhost:${PORT}/"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$SCRIPT_DIR" || {
  echo "无法进入刷题程序目录。"
  read -r "?按回车关闭窗口..."
  exit 1
}

echo "马原以练代背刷题程序"
echo "程序目录：$SCRIPT_DIR"
echo "访问地址：$URL"
echo

if ! command -v python3 >/dev/null 2>&1; then
  echo "没有找到 python3，无法启动本地服务。"
  echo "请先安装 Python 3，或在终端手动检查 python3 是否可用。"
  read -r "?按回车关闭窗口..."
  exit 1
fi

if curl -fsS "$URL" >/dev/null 2>&1; then
  echo "检测到服务已经在运行，正在打开浏览器..."
  open "$URL"
  echo "如果页面没有打开，请手动访问：$URL"
  read -r "?按回车关闭窗口..."
  exit 0
fi

echo "正在启动本地服务..."
open "$URL"
echo "服务运行中。关闭这个终端窗口会停止服务。"
echo
echo "如果浏览器页面暂时打不开，等 1-2 秒后刷新即可。"
echo

python3 -m http.server "$PORT"

echo
echo "服务已停止。"
read -r "?按回车关闭窗口..."

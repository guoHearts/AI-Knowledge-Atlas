# AI Knowledge Atlas — 内容过期与元数据校验
#
# 运行 backend/content_check CLI，扫描 Radar / Labs / Compare 的可信度元数据，
# 检测过期（90 天未验证）与缺失字段。仅检测、不修改内容文件。
#
# 用法:
#   .\scripts\check-content.ps1                 # 以今天为基准
#   .\scripts\check-content.ps1 --strict        # needs-review 也判失败
#   .\scripts\check-content.ps1 --today 2026-07-09
#
# 退出码: 0 = 通过; 1 = 存在 error（--strict 时 needs-review 也计入）。

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$BACKEND_DIR = Join-Path $ROOT "backend"

$venvPython = Join-Path $BACKEND_DIR ".venv\Scripts\python.exe"
$python = if (Test-Path $venvPython) { $venvPython } else { "python" }

Push-Location $BACKEND_DIR
try {
    & $python -m content_check.cli @args
    $code = $LASTEXITCODE
}
finally {
    Pop-Location
}

exit $code

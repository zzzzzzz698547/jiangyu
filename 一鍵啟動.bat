@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Starting dev server...
start "jiangyu-web-dev" /D "%~dp0" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort"

echo Waiting for the site to become available...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$url='http://127.0.0.1:5173/'; for($i=0;$i -lt 90;$i++){ try { $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2; if($resp.StatusCode -ge 200) { Start-Process $url; exit 0 } } catch { Start-Sleep -Seconds 1 } }; Write-Host 'Browser did not open automatically. Please open http://127.0.0.1:5173/ manually.'"

echo.
echo If the browser did not open, please visit http://127.0.0.1:5173/
pause

@echo off
echo 🚀 Iniciando KoquiFi - Frontend + Backend
echo.

echo 📦 Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install --legacy-peer-deps
)

echo.
echo 🔧 Iniciando backend en puerto 3001...
start cmd /k "set PORT=3001 && node backend-server.js"

echo.
echo 🎨 Iniciando frontend Next.js en puerto 3000...
timeout /t 3 /nobreak >nul
npm run dev

pause

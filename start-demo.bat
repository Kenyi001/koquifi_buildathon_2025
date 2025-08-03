@echo off
echo 🚀 Iniciando KoquiFI Buildathon Demo
echo ===================================

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js no está instalado
    pause
    exit /b 1
)

REM Verificar dependencias
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
)

echo 🔧 Iniciando Backend (Puerto 3000)...
start "KoquiFI Backend" cmd /k "node backend-server.js"

REM Esperar un poco
timeout /t 3 /nobreak >nul

echo 🎨 Iniciando Frontend (Puerto 3002)...
start "KoquiFI Frontend" cmd /k "node frontend-server.js"

echo.
echo ✅ ¡Servidores iniciados!
echo ================================
echo 🔗 Backend API: http://localhost:3000
echo 🎨 Frontend UI: http://localhost:3002
echo 📊 Dashboard: http://localhost:3000/dashboard
echo.
echo 🌐 Abriendo navegador...
start http://localhost:3002

echo.
echo ⚠️ Para detener: Cierra las ventanas de cmd que se abrieron
pause

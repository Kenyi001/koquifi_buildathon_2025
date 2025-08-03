@echo off
:: ==============================================
:: 🚀 KoquiFI ICM-ICTT Demo Launcher (Windows)
:: Complete Authentication & Wallet Management
:: ==============================================

echo 🔐 ==============================================
echo 🚀 KoquiFI - ICM-ICTT System
echo    Identity ^& Wallet Management Demo
echo 🔐 ==============================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instalar Node.js 18+
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado. Por favor instalar npm
    pause
    exit /b 1
)

echo ✅ Node.js y npm detectados
echo.

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    echo.
)

:: Check if .env exists
if not exist ".env" (
    echo ⚠️  Archivo .env no encontrado
    echo    Por favor configurar las variables de entorno
    pause
    exit /b 1
)

echo ✅ Configuración validada
echo.

:: Run ICM system demo
echo 🔐 1. Ejecutando demo del sistema ICM-ICTT...
node scripts/demo-icm-system.js
echo.

:: Start backend server
echo 🔧 2. Iniciando servidor backend con autenticación...
echo    Puerto: 3000
echo    Endpoints de autenticación: /auth/*
echo.

:: Kill any existing processes (Windows approach)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002"') do taskkill /f /pid %%a >nul 2>&1

:: Start backend
start /b node backend-server.js
echo ✅ Backend iniciado

:: Wait for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend server
echo 🎨 3. Iniciando servidor frontend...
echo    Puerto: 3002
echo    Autenticación integrada
echo.

start /b node frontend-server.js
echo ✅ Frontend iniciado

:: Wait for frontend to start
timeout /t 2 /nobreak >nul

echo.
echo 🎉 ==============================================
echo ✅ KoquiFI ICM-ICTT Demo Listo!
echo 🎉 ==============================================
echo.
echo 🌐 URLs del Demo:
echo    🔐 Login/Register: http://localhost:3002/auth.html
echo    🎨 Frontend:       http://localhost:3002
echo    🔧 Backend API:    http://localhost:3000
echo    📊 Dashboard:      http://localhost:3000/dashboard
echo.
echo 🔐 Características ICM-ICTT:
echo    📧 Google OAuth Login
echo    🔗 Conexión de billetera existente
echo    💰 Creación automática de billetera
echo    👤 Gestión de sesiones
echo    🎫 Registro de actividades
echo    📊 Estadísticas de usuarios
echo.
echo 🎮 Cómo usar:
echo    1. Ir a http://localhost:3002/auth.html
echo    2. Elegir 'Crear cuenta con Google' o 'Conectar billetera'
echo    3. Completar el proceso de autenticación
echo    4. Ser redirigido al dashboard principal
echo    5. Disfrutar de la experiencia completa!
echo.
echo ⚡ Endpoints de autenticación disponibles:
echo    POST /auth/init                 - Inicializar Web3Auth
echo    GET  /auth/google               - Login con Google
echo    POST /auth/register/google      - Completar registro Google
echo    POST /auth/connect/wallet       - Conectar billetera
echo    GET  /auth/profile              - Obtener perfil
echo    GET  /auth/stats                - Estadísticas de usuario
echo    POST /auth/logout               - Cerrar sesión
echo    GET  /auth/check-session        - Verificar sesión
echo    POST /auth/ticket-purchase      - Registrar compra de ticket
echo    GET  /auth/admin/users          - Listar usuarios (admin)
echo.
echo 🌐 Abriendo navegador automáticamente...
start http://localhost:3002/auth.html
echo.
echo ⏳ Demo ejecutándose... (Presiona cualquier tecla para detener)
pause >nul

:: Cleanup
echo.
echo 🛑 Deteniendo servidores...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002"') do taskkill /f /pid %%a >nul 2>&1
echo ✅ Demo detenido

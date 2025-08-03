#!/bin/bash

# ==============================================
# 🚀 KoquiFI ICM-ICTT Demo Launcher
# Complete Authentication & Wallet Management
# ==============================================

echo "🔐 =============================================="
echo "🚀 KoquiFI - ICM-ICTT System"
echo "   Identity & Wallet Management Demo"
echo "🔐 =============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instalar Node.js 18+"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instalar npm"
    exit 1
fi

echo "✅ Node.js y npm detectados"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "   Por favor configurar las variables de entorno"
    exit 1
fi

echo "✅ Configuración validada"
echo ""

# Run ICM system demo
echo "🔐 1. Ejecutando demo del sistema ICM-ICTT..."
node scripts/demo-icm-system.js
echo ""

# Start backend server
echo "🔧 2. Iniciando servidor backend con autenticación..."
echo "   Puerto: 3000"
echo "   Endpoints de autenticación: /auth/*"
echo ""

# Kill any existing processes on ports
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# Start backend in background
node backend-server.js &
BACKEND_PID=$!

echo "✅ Backend iniciado (PID: $BACKEND_PID)"

# Wait for backend to start
sleep 3

# Start frontend server
echo "🎨 3. Iniciando servidor frontend..."
echo "   Puerto: 3002"
echo "   Autenticación integrada"
echo ""

node frontend-server.js &
FRONTEND_PID=$!

echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

# Wait for frontend to start
sleep 2

echo ""
echo "🎉 =============================================="
echo "✅ KoquiFI ICM-ICTT Demo Listo!"
echo "🎉 =============================================="
echo ""
echo "🌐 URLs del Demo:"
echo "   🔐 Login/Register: http://localhost:3002/auth.html"
echo "   🎨 Frontend:       http://localhost:3002"
echo "   🔧 Backend API:    http://localhost:3000"
echo "   📊 Dashboard:      http://localhost:3000/dashboard"
echo ""
echo "🔐 Características ICM-ICTT:"
echo "   📧 Google OAuth Login"
echo "   🔗 Conexión de billetera existente"
echo "   💰 Creación automática de billetera"
echo "   👤 Gestión de sesiones"
echo "   🎫 Registro de actividades"
echo "   📊 Estadísticas de usuarios"
echo ""
echo "🎮 Cómo usar:"
echo "   1. Ir a http://localhost:3002/auth.html"
echo "   2. Elegir 'Crear cuenta con Google' o 'Conectar billetera'"
echo "   3. Completar el proceso de autenticación"
echo "   4. Ser redirigido al dashboard principal"
echo "   5. Disfrutar de la experiencia completa!"
echo ""
echo "⚡ Endpoints de autenticación disponibles:"
echo "   POST /auth/init                 - Inicializar Web3Auth"
echo "   GET  /auth/google               - Login con Google"
echo "   POST /auth/register/google      - Completar registro Google"
echo "   POST /auth/connect/wallet       - Conectar billetera"
echo "   GET  /auth/profile              - Obtener perfil"
echo "   GET  /auth/stats                - Estadísticas de usuario"
echo "   POST /auth/logout               - Cerrar sesión"
echo "   GET  /auth/check-session        - Verificar sesión"
echo "   POST /auth/ticket-purchase      - Registrar compra de ticket"
echo "   GET  /auth/admin/users          - Listar usuarios (admin)"
echo ""
echo "🔧 Para detener el demo:"
echo "   Ctrl+C en esta terminal"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Demo detenido"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "⏳ Demo ejecutándose... (Presiona Ctrl+C para detener)"
echo ""

# Wait for background processes
wait

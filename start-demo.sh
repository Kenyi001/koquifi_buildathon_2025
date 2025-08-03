#!/bin/bash

echo "🚀 Iniciando KoquiFI Buildathon Demo"
echo "==================================="

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo "🔧 Iniciando Backend (Puerto 3000)..."
node backend-server.js &
BACKEND_PID=$!

# Esperar un poco para que el backend inicie
sleep 3

echo "🎨 Iniciando Frontend (Puerto 3002)..."
node frontend-server.js &
FRONTEND_PID=$!

echo ""
echo "✅ ¡Servidores iniciados!"
echo "================================"
echo "🔗 Backend API: http://localhost:3000"
echo "🎨 Frontend UI: http://localhost:3002"
echo "📊 Dashboard: http://localhost:3000/dashboard"
echo ""
echo "⚠️ Para detener los servidores:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🌐 Abre http://localhost:3002 en tu navegador"

# Esperar
read -p "Presiona Enter para detener los servidores..."

# Detener procesos
kill $BACKEND_PID $FRONTEND_PID
echo "🛑 Servidores detenidos"

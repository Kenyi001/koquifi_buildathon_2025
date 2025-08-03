# 🚀 Comandos Útiles para KoquiFi

## 📋 **Comandos Principales**

### 🟢 **Desarrollo Local**
```bash
# Iniciar servidor de desarrollo Next.js
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm start

# Verificar errores de código
npm run lint
```

### 🔗 **Blockchain & Contratos**
```bash
# Compilar contratos Hardhat
npm run hardhat:compile

# Ejecutar tests de contratos
npm run hardhat:test

# Desplegar contratos en Avalanche Fuji
npm run hardhat:deploy

# Iniciar nodo local de Hardhat
npm run hardhat:node
```

### 🧪 **Testing & Verificación**
```bash
# Verificar conexión del sistema
node verify-system.js

# Probar funcionalidades específicas
node test-lottery.js

# Verificar configuración ICM
node verify-icm.js
```

## 🌐 **URLs Importantes**

### 📱 **Aplicación Local**
- **Frontend**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Pruebas Blockchain**: http://localhost:3000/blockchain-test

### 🔧 **Herramientas de Desarrollo**
- **Remix IDE**: https://remix.ethereum.org (para desplegar contratos)
- **Avalanche Fuji Explorer**: https://testnet.snowtrace.io
- **Ethereum Sepolia Explorer**: https://sepolia.etherscan.io

### 💰 **Faucets (Tokens Gratis)**
- **Avalanche Fuji**: https://faucet.avax.network/
- **Ethereum Sepolia**: https://sepoliafaucet.com/

## 🏗️ **Comandos de Configuración**

### 📦 **Instalación Inicial**
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Compilar contratos por primera vez
npm run hardhat:compile
```

### 🔄 **Reiniciar Proyecto**
```bash
# Limpiar cache y reinstalar
rm -rf node_modules .next
npm install
npm run build
```

## 🎯 **Flujo de Trabajo Recomendado**

### 1️⃣ **Desarrollo Frontend**
```bash
# Terminal 1: Servidor de desarrollo
npm run dev

# Terminal 2: Verificar en navegador
# http://localhost:3000
```

### 2️⃣ **Pruebas Blockchain**
```bash
# 1. Ir a la página de pruebas
# http://localhost:3000/blockchain-test

# 2. Conectar MetaMask
# 3. Cambiar a red Avalanche Fuji (Chain ID: 43113)
# 4. Obtener fondos del faucet
# 5. Probar funcionalidades
```

### 3️⃣ **Despliegue de Contratos**
```bash
# Usando Remix IDE (Recomendado)
# 1. Ir a https://remix.ethereum.org
# 2. Subir archivos de /contracts/
# 3. Compilar y desplegar
# 4. Actualizar direcciones en lib/contracts.ts

# O usando Hardhat
npm run hardhat:deploy
```

## 🛠️ **Troubleshooting**

### ❌ **Errores Comunes**

**Error de puerto ocupado:**
```bash
# Cambiar puerto Next.js
npm run dev -- -p 3001
```

**Error de MetaMask:**
```bash
# Reiniciar conexión de wallet en aplicación
# Cambiar de red y volver en MetaMask
```

**Errores de compilación:**
```bash
# Limpiar cache
rm -rf .next
npm run build
```

**Problemas con contratos:**
```bash
# Recompilar contratos
npm run hardhat:compile

# Verificar configuración
node verify-system.js
```

## 📱 **Testing Manual**

### ✅ **Lista de Verificación**

1. **Frontend**
   - [ ] Página principal carga correctamente
   - [ ] Dashboard es accesible
   - [ ] Autenticación Google funciona
   - [ ] Wallet connection funciona

2. **Blockchain**
   - [ ] MetaMask se conecta
   - [ ] Cambio de red funciona
   - [ ] Transacciones se envían
   - [ ] Balances se actualizan

3. **Funcionalidades**
   - [ ] Depósitos funcionan
   - [ ] Retiros funcionan
   - [ ] Lotería es accesible
   - [ ] Intercambio funciona

## 🚨 **Comandos de Emergencia**

```bash
# Resetear completamente el proyecto
git clean -fdx
npm install
npm run build

# Verificar estado del sistema
node verify-system.js

# Probar conexión básica
curl http://localhost:3000/api/health || echo "API no disponible"
```

## 📝 **Notas Importantes**

- ⚠️ **Usar solo testnets** para pruebas
- 🔐 **Nunca compartir claves privadas reales**
- 💾 **Los datos de prueba se guardan en localStorage**
- 🔄 **Refrescar página si hay problemas de estado**

---

**Para soporte**: Revisar logs en consola del navegador y terminal

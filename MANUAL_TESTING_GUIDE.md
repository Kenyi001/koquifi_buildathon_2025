# 🎯 **Guía de Pruebas Manual - KoquiFi**

## 📋 **Pasos para Ejecutar las Pruebas**

### **🔧 Paso 1: Iniciar Backend**
```bash
# Abrir nueva terminal/cmd en el directorio del proyecto
cd "d:\Projects\Buildathon\koquifi_buildathon_2025"

# Ejecutar el backend
set PORT=3001
node backend-server.js

# Deberías ver:
# 🚀 Servidor KoquiFi ejecutándose en puerto 3001
# 🔌 Conectando a contratos...
```

### **🎨 Paso 2: Iniciar Frontend**
```bash
# Abrir otra terminal/cmd en el directorio del proyecto
cd "d:\Projects\Buildathon\koquifi_buildathon_2025"

# Ejecutar el frontend
npm run dev

# Deberías ver:
# ▲ Next.js 15.4.5
# - Local: http://localhost:3000
```

### **🌐 Paso 3: Abrir en Navegador**
- Ir a: http://localhost:3000
- Deberías ver la interfaz de KoquiFi

---

## ✅ **Checklist de Verificación**

### **🔍 Visual Check**
- [ ] **Página carga**: Sin errores 404 o 500
- [ ] **Tema aplicado**: Colores verde/dorado visibles
- [ ] **Navbar**: Menú de navegación presente
- [ ] **Responsive**: Se adapta al tamaño de ventana
- [ ] **Animaciones**: Elementos con micro-interacciones

### **🖱️ Navegación**
- [ ] **Dashboard**: Click y navegación funciona
- [ ] **Lotería**: Sección accesible
- [ ] **Depósitos**: Formularios visibles
- [ ] **Intercambio**: Interface de swap
- [ ] **Retiros**: Sección de retiro
- [ ] **Ahorros**: Coming soon visible

### **📱 Mobile Test**
- [ ] **Responsive**: Redimensionar ventana a 400px width
- [ ] **Menu móvil**: Hamburger menu funcional
- [ ] **Cards**: Se apilan verticalmente
- [ ] **Buttons**: Tamaño apropiado para touch

---

## 🧪 **Pruebas de Funcionalidad**

### **🔐 Test de Autenticación**
1. **Click en "Conectar Wallet"**
2. **Verificar**: Modal de autenticación aparece
3. **Opciones**: Google OAuth y Wallet Connect visibles
4. **Estados**: Loading states funcionando

### **💰 Test de Dashboard**
1. **Balance Cards**: KOFICOIN y USDT mostrados
2. **Staking Progress**: Barra de progreso animada
3. **Transaction History**: Lista de transacciones
4. **Quick Actions**: Botones de acción rápida

### **🎰 Test de Lotería**
1. **Grid de números**: 50 números seleccionables
2. **Selección**: Click en números los marca
3. **Random**: Botón genera números aleatorios
4. **Prize Pool**: Muestra pool actual
5. **Countdown**: Timer para próximo sorteo

### **💱 Test de Depósitos**
1. **Formulario BOB**: Inputs funcionando
2. **Validación**: Campos requeridos
3. **Conversion rate**: Cálculo automático
4. **Resumen**: Preview antes de confirmar

### **🔄 Test de Intercambio**
1. **Token selector**: Dropdown funcional
2. **Amount input**: Números aceptados
3. **Rate calculation**: Automático
4. **Swap button**: Estado habilitado/deshabilitado

---

## 🚨 **Errores Comunes y Soluciones**

### **❌ Puerto 3000 ocupado**
```bash
# Verificar qué usa el puerto
netstat -ano | findstr :3000

# Matar proceso si es necesario
taskkill /PID [PID_NUMBER] /F

# O usar puerto alternativo
npm run dev -- -p 3001
```

### **❌ Node modules faltantes**
```bash
# Reinstalar dependencias
npm install --legacy-peer-deps

# Si persiste error
rmdir /s node_modules
npm install --legacy-peer-deps
```

### **❌ Backend no conecta**
```bash
# Verificar archivo .env existe
dir .env

# Verificar puerto está libre
netstat -ano | findstr :3001

# Verificar Hardhat blockchain corriendo
npx hardhat node
```

---

## 📊 **Resultados Esperados**

### **✅ SUCCESS Indicators**
- 🎨 **Frontend**: Página carga sin errores
- 🔧 **Backend**: API responde en puerto 3001
- ⛓️ **Blockchain**: Hardhat node corriendo
- 🎯 **Navigation**: Todas las secciones accesibles
- 📱 **Responsive**: Funciona en mobile/desktop

### **🎉 READY FOR BUILDATHON**
Si todos los tests pasan, el sistema está **100% listo** para la competencia:

- ✅ **Professional UI/UX** 
- ✅ **Complete Authentication System**
- ✅ **Web3 Integration Ready**
- ✅ **Responsive Design**
- ✅ **Production-Ready Code**

---

## 🤝 **¿Necesitas Ayuda?**

Si encuentras algún error:

1. **Copia el mensaje de error exacto**
2. **Indica qué paso específico falló**
3. **Menciona si es frontend o backend**
4. **Comparte screenshot si es visual**

**¡El sistema está diseñado para funcionar perfectamente! 🚀**

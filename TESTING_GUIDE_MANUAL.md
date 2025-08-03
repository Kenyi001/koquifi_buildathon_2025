# 🚀 **Guía de Pruebas KoquiFi - Paso a Paso**

## 📋 **Instrucciones Manuales**

### **🔧 PASO 1: Iniciar Backend**
```powershell
# Abrir PowerShell en el directorio del proyecto
cd "d:\Projects\Buildathon\koquifi_buildathon_2025"

# Opción A: Usar el script (SINTAXIS CORRECTA)
.\start-backend.bat

# Opción B: Comando directo
$env:PORT=3001
node backend-server.js
```

**✅ Deberías ver:**
```
🚀 Servidor KoquiFi ejecutándose en puerto 3001
🔌 Conectando a contratos...
✅ Contratos inicializados correctamente
📡 API REST disponible en http://localhost:3001
```

---

### **🎨 PASO 2: Iniciar Frontend**
```powershell
# Abrir NUEVA terminal/cmd en el mismo directorio
cd "d:\Projects\Buildathon\koquifi_buildathon_2025"

# Opción A: Usar el script (SINTAXIS CORRECTA)
.\start-frontend.bat

# Opción B: Comando directo
npm run dev
```

**✅ Deberías ver:**
```
▲ Next.js 15.4.5
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.3s
```

---

### **🌐 PASO 3: Abrir en Navegador**
1. **Ir a:** http://localhost:3000
2. **Verificar:** Página carga sin errores
3. **Comprobar:** No hay errores en console (F12)

---

## 🧪 **Test 1: Verificación Visual**

### **✅ Dashboard Principal**
- [ ] **Logo KoquiFi** visible en navbar
- [ ] **Menú de navegación** con 6 secciones
- [ ] **Balance Cards** con KOFICOIN y USDT
- [ ] **Iconos** en las tarjetas funcionando
- [ ] **Colores verde/dorado** aplicados
- [ ] **Animaciones** fluidas al cargar

### **✅ Navegación**
- [ ] **Dashboard** - Click funciona
- [ ] **Lotería** - Sección accesible
- [ ] **Depósitos** - Formularios visibles  
- [ ] **Intercambio** - Interface de swap
- [ ] **Retiros** - Formularios de retiro
- [ ] **Ahorros** - "Coming Soon" visible

---

## 🧪 **Test 2: Funcionalidad de Secciones**

### **🏠 Test Dashboard**
1. **Balances**: ¿Se muestran números de KOFICOIN y USDT?
2. **Staking Progress**: ¿Hay barra de progreso animada?
3. **Transaction History**: ¿Lista de transacciones visible?
4. **Quick Actions**: ¿Botones de acción rápida?

### **🎰 Test Lotería**
1. **Grid números**: ¿Grid de 50 números (1-50)?
2. **Selección**: ¿Click marca/desmarca números?
3. **Random**: ¿Botón genera números aleatorios?
4. **Prize Pool**: ¿Muestra pool actual?
5. **Countdown**: ¿Timer para próximo sorteo?

### **💰 Test Depósitos**
1. **Formulario BOB**: ¿Inputs aceptan números?
2. **Crypto Form**: ¿Formulario alternativo visible?
3. **Validation**: ¿Campos requeridos funcionan?
4. **Preview**: ¿Resumen antes de confirmar?

### **🔄 Test Intercambio**
1. **Token Selector**: ¿Dropdown con BOB/USDT/KOFI?
2. **Amount Input**: ¿Campo acepta números?
3. **Rate Display**: ¿Muestra tasa de cambio?
4. **Swap Button**: ¿Estado enabled/disabled?

### **💸 Test Retiros**
1. **Address Input**: ¿Campo para wallet address?
2. **Amount Input**: ¿Validación de balance?
3. **Confirmation**: ¿Proceso de confirmación?
4. **Security**: ¿Medidas de seguridad visibles?

---

## 🧪 **Test 3: Responsive Design**

### **📱 Mobile Test (400px width)**
1. **Redimensionar** ventana del navegador a ~400px
2. **Verificar:**
   - [ ] **Navbar**: ¿Hamburger menu aparece?
   - [ ] **Cards**: ¿Se apilan verticalmente?
   - [ ] **Forms**: ¿Inputs se adaptan?
   - [ ] **Buttons**: ¿Tamaño apropiado?

### **💻 Desktop Test (1200px width)**
1. **Expandir** ventana del navegador a pantalla completa
2. **Verificar:**
   - [ ] **Layout**: ¿Grid de 2 columnas?
   - [ ] **Sidebar**: ¿Navegación expandida?
   - [ ] **Cards**: ¿Grid layout correcto?
   - [ ] **Spacing**: ¿Márgenes apropiados?

---

## 🧪 **Test 4: Autenticación (Si funciona)**

### **🔐 Test Google OAuth**
1. **Click** en botón "Conectar Wallet" o "Login"
2. **Verificar:** ¿Modal de autenticación aparece?
3. **Opciones:** ¿Google OAuth y Wallet Connect visibles?
4. **Estados:** ¿Loading states funcionan?

### **🔗 Test Wallet Connect**
1. **Click** en "Conectar Wallet Existente"
2. **Verificar:** ¿Opciones de wallet (MetaMask/Core)?
3. **Connection:** ¿Intenta conectar con extensión?

---

## 📊 **Resultados Esperados**

### **✅ SUCCESS (Todo funciona)**
- 🎨 **UI/UX profesional** con tema verde/dorado
- 🔄 **Navegación fluida** entre todas las secciones
- 📱 **Responsive design** perfecto
- ⚡ **Performance rápido** sin lag
- 🔧 **Sin errores** en browser console

### **🎉 READY FOR BUILDATHON**
Si todos los tests pasan:
- ✅ **Sistema completo funcionando**
- ✅ **UI/UX lista para competencia**
- ✅ **Backend integrado correctamente**
- ✅ **Preparado para deploy en Vercel**

---

## 🚨 **Si hay problemas**

### **❌ Frontend no carga**
```bash
# Verificar puerto disponible
netstat -ano | findstr :3000

# Reinstalar dependencias si es necesario
npm install --legacy-peer-deps

# Usar puerto alternativo
npm run dev -- -p 3001
```

### **❌ Backend no responde**
```bash
# Verificar archivo .env existe
dir .env

# Verificar puerto 3001 libre
netstat -ano | findstr :3001

# Verificar node_modules
dir node_modules
```

### **❌ Errores en console**
- **Copia exacto** el mensaje de error
- **Indica** en qué sección ocurre
- **Menciona** si es visual o funcional

---

## 🎯 **¡Ejecuta los Tests!**

**Sigue esta guía paso a paso y dime:**

1. **¿El backend se inicia correctamente?**
2. **¿El frontend carga en http://localhost:3000?**
3. **¿Qué secciones funcionan y cuáles no?**
4. **¿Hay algún error específico?**

**¡Tu sistema KoquiFi debería estar funcionando perfectamente!** 🚀

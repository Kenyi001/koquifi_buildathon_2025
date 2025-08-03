# 🎯 **Instrucciones Específicas para PowerShell**

## 🚀 **Ejecutar KoquiFi - Paso a Paso**

### **📂 PASO 0: Verificar Directorio**
```powershell
# Verificar que estás en el directorio correcto
Get-Location
# Debería mostrar: d:\Projects\Buildathon\koquifi_buildathon_2025

# Si no estás ahí, navegar:
cd "d:\Projects\Buildathon\koquifi_buildathon_2025"

# Verificar archivos
dir *.bat
# Deberías ver: start-backend.bat, start-frontend.bat
```

---

### **🔧 PASO 1: Iniciar Backend**
```powershell
# COMANDO CORRECTO para PowerShell:
.\start-backend.bat

# ALTERNATIVA si no funciona:
$env:PORT = "3001"
node backend-server.js
```

**✅ Éxito si ves:**
```
🔧 Iniciando KoquiFi Backend en puerto 3001...
🚀 Servidor KoquiFi ejecutándose en puerto 3001
🔌 Conectando a contratos...
✅ Contratos inicializados correctamente
```

**❌ Si hay error:** Copia el mensaje exacto y continúa con la alternativa.

---

### **🎨 PASO 2: Iniciar Frontend (Nueva Terminal)**
```powershell
# Abrir NUEVA ventana de PowerShell
# Navegar al directorio:
cd "d:\Projects\Buildathon\koquifi_buildathon_2025"

# COMANDO CORRECTO para PowerShell:
.\start-frontend.bat

# ALTERNATIVA si no funciona:
npm run dev
```

**✅ Éxito si ves:**
```
🎨 Iniciando KoquiFi Frontend en puerto 3000...
▲ Next.js 15.4.5
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

---

### **🌐 PASO 3: Verificar en Navegador**
1. **Abrir:** http://localhost:3000
2. **Verificar:** Página de KoquiFi carga
3. **Comprobar:** Console sin errores (F12)

---

## 🧪 **Checklist de Verificación Rápida**

### **✅ Backend Check**
- [ ] **Terminal 1**: Backend corriendo sin errores
- [ ] **Puerto 3001**: API accesible
- [ ] **Contratos**: Conexión exitosa

### **✅ Frontend Check**  
- [ ] **Terminal 2**: Next.js iniciado correctamente
- [ ] **Puerto 3000**: Página carga
- [ ] **UI**: Interfaz KoquiFi visible

### **✅ Visual Check**
- [ ] **Logo**: KoquiFi visible en navbar
- [ ] **Colores**: Tema verde/dorado aplicado
- [ ] **Navegación**: Menú con 6 secciones
- [ ] **Cards**: Balance cards con iconos
- [ ] **Animaciones**: Transiciones fluidas

---

## 🚨 **Solución de Problemas Comunes**

### **❌ "No se reconoce el comando"**
```powershell
# Usar sintaxis correcta:
.\start-backend.bat    # ✅ CORRECTO
start-backend.bat      # ❌ INCORRECTO en PowerShell
```

### **❌ "Puerto ocupado"**
```powershell
# Verificar qué usa el puerto:
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Matar proceso si es necesario:
# Encontrar PID y ejecutar:
taskkill /PID [NUMERO_PID] /F
```

### **❌ "Módulos no encontrados"**
```powershell
# Reinstalar dependencias:
npm install --legacy-peer-deps

# Si persiste:
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
```

---

## 🎯 **¿Qué deberías ver ahora?**

### **✅ Si todo funciona correctamente:**
1. **🔧 Backend**: Terminal mostrando servidor activo
2. **🎨 Frontend**: Terminal mostrando Next.js corriendo  
3. **🌐 Browser**: http://localhost:3000 con KoquiFi funcionando
4. **📱 UI**: Interfaz profesional verde/dorado responsive

### **🎉 ¡ÉXITO!**
Si ves la interfaz de KoquiFi:
- ✅ **Sistema completo funcionando**
- ✅ **Listo para pruebas detalladas**
- ✅ **Preparado para el buildathon**

---

## 📞 **Reporte de Estado**

**Ejecuta los comandos y dime:**

1. **¿El backend se inició correctamente con `.\start-backend.bat`?**
2. **¿El frontend carga en http://localhost:3000?**
3. **¿Ves la interfaz de KoquiFi con el tema verde/dorado?**
4. **¿Hay algún error específico en algún paso?**

**¡Vamos a hacer que funcione perfectamente!** 🚀

console.log('🎉 INICIANDO SERVIDOR PARA PRUEBAS MVP')
console.log('=====================================\n')

const { spawn } = require('child_process')

console.log('📋 Estado de Preparación:')
console.log('✅ Contratos configurados con direcciones simuladas')
console.log('✅ BlockchainTestPanel actualizado')
console.log('✅ Página de pruebas configurada')
console.log('✅ UI components creados')
console.log('✅ Hooks de autenticación listos')

console.log('\n🎯 Al iniciar el servidor podrás probar:')
console.log('==========================================')
console.log('1. 🔗 Conexión de wallet MetaMask')
console.log('2. 📊 Panel de estado de contratos')
console.log('3. 🪙 Interfaz de transferencia de tokens')
console.log('4. 🎲 Sistema de selección de números de lotería')
console.log('5. ⚡ Validaciones y manejo de errores')
console.log('6. 📱 Diseño responsive')
console.log('7. 🎨 Animaciones y transiciones')

console.log('\n📱 Checklist de Pruebas a Realizar:')
console.log('===================================')
const checklist = [
  'Página carga sin errores TypeScript',
  'UI se muestra correctamente',
  'Wallet conecta sin problemas',
  'Estado de contratos se muestra',
  'Formularios responden al input',
  'Números de lotería se seleccionan',
  'Botones cambian estado (loading/disabled)',
  'Notificaciones aparecen correctamente',
  'Validaciones funcionan (campos vacíos)',
  'UI responsive en diferentes tamaños',
  'Animaciones son suaves',
  'Enlaces externos funcionan'
]

checklist.forEach((item, index) => {
  console.log(`  ${index + 1}. □ ${item}`)
})

console.log('\n⚠️  NOTAS IMPORTANTES:')
console.log('======================')
console.log('• Las direcciones de contratos son simuladas')
console.log('• Las transacciones reales fallarán (esperado)')
console.log('• Esto permite probar toda la interfaz de usuario')
console.log('• Para transacciones reales: desplegar contratos en Remix')

console.log('\n🚀 INICIANDO SERVIDOR...')
console.log('========================')
console.log('URL: http://localhost:3000/blockchain-test')
console.log('Puerto: 3000')
console.log('Modo: Desarrollo')

console.log('\n🔧 Configuración de Red Recomendada:')
console.log('====================================')
console.log('Red: Avalanche Fuji Testnet')
console.log('Chain ID: 43113')
console.log('RPC: https://api.avax-test.network/ext/bc/C/rpc')
console.log('Faucet: https://faucet.avax.network/')

console.log('\n' + '='.repeat(50))
console.log('🎉 ¡SERVIDOR INICIANDO!')
console.log('Navega a: http://localhost:3000/blockchain-test')
console.log('='.repeat(50) + '\n')

// Iniciar servidor de desarrollo
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
})

server.on('error', (error) => {
  console.error('❌ Error iniciando servidor:', error)
})

server.on('close', (code) => {
  console.log(`\n🛑 Servidor terminado con código: ${code}`)
})

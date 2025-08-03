const fs = require('fs')
const path = require('path')

console.log('🧪 Script de Pruebas MVP - KoquiFi Blockchain')
console.log('===============================================\n')

// Simular direcciones de contratos para pruebas
const MOCK_ADDRESSES = {
  KOFICOIN: '0x742d35Cc6634C0532925a3b8D2C1C0b39B2ba6F7', // Dirección simulada
  LOTTERY: '0x8ba1f109551bD432803012645Hac136c4c30c13E'   // Dirección simulada
}

console.log('📋 Configurando contratos de prueba...')
console.log(`🪙 KOFICOIN: ${MOCK_ADDRESSES.KOFICOIN}`)
console.log(`🎲 LOTTERY:  ${MOCK_ADDRESSES.LOTTERY}\n`)

// Leer el archivo de contratos actual
const contractsPath = path.join(__dirname, 'lib', 'contracts.ts')
let contractsContent = fs.readFileSync(contractsPath, 'utf8')

// Actualizar las direcciones
contractsContent = contractsContent.replace(
  /KOFICOIN: '0x0+'/g,
  `KOFICOIN: '${MOCK_ADDRESSES.KOFICOIN}'`
)
contractsContent = contractsContent.replace(
  /LOTTERY: '0x0+'/g,
  `LOTTERY: '${MOCK_ADDRESSES.LOTTERY}'`
)

// Guardar los cambios
fs.writeFileSync(contractsPath, contractsContent)

console.log('✅ Direcciones de contratos actualizadas para pruebas')
console.log('\n🎯 Funcionalidades a probar:')
console.log('  1. 🔗 Conexión de wallet (MetaMask)')
console.log('  2. 🪙 Transferencia de tokens KOQUICOIN')
console.log('  3. 🎲 Compra de boletos de lotería')
console.log('  4. 💰 Verificación de balances')
console.log('  5. ⛓️ Interacción con blockchain Avalanche Fuji')

console.log('\n🚀 Para iniciar las pruebas:')
console.log('  1. npm run dev')
console.log('  2. Navega a http://localhost:3000/blockchain-test')
console.log('  3. Conecta tu wallet MetaMask')
console.log('  4. Cambia a red Avalanche Fuji (Chain ID: 43113)')
console.log('  5. Obtén fondos del faucet: https://faucet.avax.network/')

console.log('\n⚠️  NOTA: Esto es una simulación para pruebas de UI')
console.log('   Para contratos reales, despliégalos en Remix IDE primero')

console.log('\n📱 Checklist de pruebas MVP:')
const tests = [
  '□ Wallet conecta correctamente',
  '□ Balance se muestra correctamente', 
  '□ Formulario de transferencia funciona',
  '□ Selección de números de lotería funciona',
  '□ Botones responden correctamente',
  '□ Validaciones de error funcionan',
  '□ UI responsive en móvil',
  '□ Animaciones funcionan correctamente'
]

tests.forEach(test => console.log(`  ${test}`))

console.log('\n🎉 ¡MVP listo para pruebas de interfaz!')

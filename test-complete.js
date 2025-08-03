#!/usr/bin/env node

console.log('🎯 Sistema de Pruebas Completas MVP - KoquiFi')
console.log('============================================\n')

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Función para ejecutar comandos
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`)
    const result = execSync(command, { encoding: 'utf8', cwd: __dirname })
    console.log(`✅ ${description} - ÉXITO`)
    return result
  } catch (error) {
    console.log(`❌ ${description} - ERROR:`, error.message)
    return null
  }
}

// 1. Verificar compilación TypeScript
console.log('1️⃣ VERIFICACIÓN DE COMPILACIÓN')
console.log('===============================')
const buildResult = runCommand('npm run build', 'Compilación TypeScript')

if (buildResult) {
  console.log('✅ Todos los archivos TypeScript compilan correctamente\n')
} else {
  console.log('❌ Error en compilación TypeScript\n')
}

// 2. Verificar estructura de archivos MVP
console.log('2️⃣ VERIFICACIÓN DE ESTRUCTURA MVP')
console.log('===================================')

const requiredFiles = [
  'components/ui/BlockchainTestPanel.tsx',
  'hooks/useAuth.ts',
  'lib/contracts.ts',
  'components/ui/button.tsx',
  'components/ui/card.tsx',
  'contracts/KofiCoin.sol',
  'contracts/KoquifiLottery.sol'
]

let allFilesExist = true
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file))
  console.log(`${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allFilesExist = false
})

console.log(`\n${allFilesExist ? '✅' : '❌'} Estructura de archivos ${allFilesExist ? 'COMPLETA' : 'INCOMPLETA'}\n`)

// 3. Verificar configuración de contratos
console.log('3️⃣ VERIFICACIÓN DE CONTRATOS')
console.log('=============================')

const contractsFile = path.join(__dirname, 'lib/contracts.ts')
const contractsContent = fs.readFileSync(contractsFile, 'utf8')

const hasKofiAddress = contractsContent.includes("KOFICOIN: '0x742d35Cc6634C0532925a3b8D2C1C0b39B2ba6F7'")
const hasLotteryAddress = contractsContent.includes("LOTTERY: '0x8ba1f109551bD432803012645Hac136c4c30c13E'")

console.log(`${hasKofiAddress ? '✅' : '❌'} Token KOQUICOIN configurado`)
console.log(`${hasLotteryAddress ? '✅' : '❌'} Contrato Lotería configurado`)
console.log(`${hasKofiAddress && hasLotteryAddress ? '✅' : '❌'} Configuración de contratos ${hasKofiAddress && hasLotteryAddress ? 'COMPLETA' : 'INCOMPLETA'}\n`)

// 4. Verificar funcionalidades del Panel de Pruebas
console.log('4️⃣ VERIFICACIÓN DEL PANEL DE PRUEBAS')
console.log('====================================')

const panelFile = path.join(__dirname, 'components/ui/BlockchainTestPanel.tsx')
const panelContent = fs.readFileSync(panelFile, 'utf8')

const features = [
  { name: 'Conexión de Wallet', check: panelContent.includes('useAuth') },
  { name: 'Transferencia de Tokens', check: panelContent.includes('handleTransferToken') },
  { name: 'Compra de Lotería', check: panelContent.includes('handleBuyLotteryTicket') },
  { name: 'Selección de Números', check: panelContent.includes('toggleNumber') },
  { name: 'Verificación de Estado', check: panelContent.includes('isContractDeployed') },
  { name: 'Animaciones UI', check: panelContent.includes('framer-motion') },
  { name: 'Notificaciones', check: panelContent.includes('toast') },
  { name: 'Manejo de Errores', check: panelContent.includes('try') && panelContent.includes('catch') }
]

features.forEach(feature => {
  console.log(`${feature.check ? '✅' : '❌'} ${feature.name}`)
})

const allFeaturesWork = features.every(f => f.check)
console.log(`\n${allFeaturesWork ? '✅' : '❌'} Funcionalidades del panel ${allFeaturesWork ? 'COMPLETAS' : 'INCOMPLETAS'}\n`)

// 5. Resumen final
console.log('5️⃣ RESUMEN DE PRUEBAS MVP')
console.log('=========================')

const tests = [
  { name: 'Compilación TypeScript', status: buildResult !== null },
  { name: 'Estructura de Archivos', status: allFilesExist },
  { name: 'Configuración de Contratos', status: hasKofiAddress && hasLotteryAddress },
  { name: 'Funcionalidades del Panel', status: allFeaturesWork }
]

console.log('Estado de las pruebas:')
tests.forEach(test => {
  console.log(`  ${test.status ? '✅' : '❌'} ${test.name}`)
})

const allTestsPassed = tests.every(t => t.status)
console.log(`\n🎯 RESULTADO FINAL: ${allTestsPassed ? '✅ MVP LISTO PARA PRUEBAS' : '❌ REQUIERE CORRECCIONES'}`)

if (allTestsPassed) {
  console.log('\n🚀 INSTRUCCIONES PARA PRUEBAS EN VIVO:')
  console.log('=====================================')
  console.log('1. npm run dev                    # Iniciar servidor')
  console.log('2. http://localhost:3000/blockchain-test')
  console.log('3. Conectar MetaMask')
  console.log('4. Cambiar a Avalanche Fuji (43113)')
  console.log('5. Obtener AVAX del faucet')
  console.log('6. Probar transferencias y lotería')
  
  console.log('\n📋 CHECKLIST DE PRUEBAS MANUALES:')
  console.log('==================================')
  console.log('□ Wallet conecta sin errores')
  console.log('□ Balance se muestra (aunque sea 0)')
  console.log('□ Formulario de transferencia acepta input')
  console.log('□ Números de lotería se seleccionan')
  console.log('□ Botones cambian estado (loading)')
  console.log('□ Errores se muestran correctamente')
  console.log('□ UI es responsive en móvil')
  console.log('□ Animaciones funcionan suavemente')
  
  console.log('\n⚠️  NOTA IMPORTANTE:')
  console.log('Las direcciones actuales son simuladas.')
  console.log('Para transacciones reales, despliega los contratos en Remix IDE.')
} else {
  console.log('\n🔧 CORRECCIONES NECESARIAS:')
  tests.forEach(test => {
    if (!test.status) {
      console.log(`❌ ${test.name} requiere atención`)
    }
  })
}

console.log('\n🎉 Pruebas MVP completadas!')

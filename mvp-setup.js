#!/usr/bin/env node

/**
 * Configurador Rápido de Contratos MVP
 * node mvp-setup.js [action]
 */

const fs = require('fs')
const path = require('path')

const contractsPath = path.join(__dirname, 'lib', 'contracts.ts')

function showCurrentStatus() {
  console.log(`
🎯 Estado Actual del MVP - KoquiFi

📋 Contratos Necesarios:
  1. ✅ KofiCoin.sol       - Token ERC20 KOQUICOIN
  2. ✅ KoquifiLottery.sol - Sistema de lotería

📍 Ubicación de archivos:
  📁 /contracts/KofiCoin.sol
  📁 /contracts/KoquifiLottery.sol
  📁 /contracts/DEPLOYMENT.md (guía completa)

⚙️ Configuración actual:`)

  try {
    const content = fs.readFileSync(contractsPath, 'utf8')
    
    // Extraer direcciones de Fuji
    const fujiMatch = content.match(/43113:\s*{([^}]*)}/)
    if (fujiMatch) {
      const kofiMatch = fujiMatch[1].match(/KOFICOIN:\s*'([^']*)'/)
      const lotteryMatch = fujiMatch[1].match(/LOTTERY:\s*'([^']*)'/)
      
      const kofiAddr = kofiMatch ? kofiMatch[1] : '0x0000000000000000000000000000000000000000'
      const lotteryAddr = lotteryMatch ? lotteryMatch[1] : '0x0000000000000000000000000000000000000000'
      
      console.log(`
🔵 Avalanche Fuji (Recomendado para MVP):
  🪙 KOFICOIN:  ${kofiAddr === '0x0000000000000000000000000000000000000000' ? '❌ No configurado' : '✅ ' + kofiAddr}
  🎲 LOTTERY:   ${lotteryAddr === '0x0000000000000000000000000000000000000000' ? '❌ No configurado' : '✅ ' + lotteryAddr}`)
      
      if (kofiAddr === '0x0000000000000000000000000000000000000000' || lotteryAddr === '0x0000000000000000000000000000000000000000') {
        console.log(`
⚠️  ACCIÓN REQUERIDA:
  1. Despliega los contratos usando Remix IDE
  2. Ejecuta: node mvp-setup.js update [kofi_address] [lottery_address]
`)
      } else {
        console.log(`
✅ MVP LISTO PARA PRUEBAS!
  🌐 Accede a: http://localhost:3000/blockchain-test
  🔗 Conecta MetaMask en red Avalanche Fuji
`)
      }
    }
  } catch (error) {
    console.error('❌ Error leyendo configuración:', error.message)
  }
}

function updateAddresses(kofiAddr, lotteryAddr) {
  try {
    let content = fs.readFileSync(contractsPath, 'utf8')
    
    // Actualizar direcciones para Fuji (43113)
    content = content.replace(
      /(43113:\s*{[\s\S]*?KOFICOIN:\s*')[^']*(')/,
      `$1${kofiAddr}$2`
    )
    content = content.replace(
      /(43113:\s*{[\s\S]*?LOTTERY:\s*')[^']*(')/,
      `$1${lotteryAddr}$2`
    )
    
    fs.writeFileSync(contractsPath, content)
    
    console.log(`
✅ Direcciones actualizadas en Avalanche Fuji:
  🪙 KOFICOIN: ${kofiAddr}
  🎲 LOTTERY:  ${lotteryAddr}

🚀 Próximos pasos:
  1. npm run dev
  2. Ve a http://localhost:3000/blockchain-test
  3. Conecta MetaMask y cambia a Avalanche Fuji
  4. Prueba transferencias y lotería
`)
    
  } catch (error) {
    console.error('❌ Error actualizando:', error.message)
  }
}

function showDeploymentGuide() {
  console.log(`
📚 GUÍA RÁPIDA DE DESPLIEGUE MVP

🔧 Paso 1: Preparar Remix IDE
  1. Ve a https://remix.ethereum.org
  2. Crea nueva carpeta "koquifi-mvp"
  3. Sube los archivos:
     - /contracts/KofiCoin.sol
     - /contracts/KoquifiLottery.sol

🔧 Paso 2: Configurar MetaMask
  1. Añade red Avalanche Fuji:
     - RPC: https://api.avax-test.network/ext/bc/C/rpc
     - Chain ID: 43113
     - Símbolo: AVAX
  2. Obtén AVAX gratis: https://faucet.avax.network/

🔧 Paso 3: Desplegar Contratos
  1. En Remix, compila KofiCoin.sol
  2. Despliega (asegúrate de estar en Fuji)
  3. Copia la dirección del contrato
  4. Repite para KoquifiLottery.sol

🔧 Paso 4: Configurar Aplicación
  node mvp-setup.js update [direccion_kofi] [direccion_lottery]

💡 Ejemplo:
  node mvp-setup.js update 0x123...abc 0x456...def

🔗 Enlaces útiles:
  • Remix IDE: https://remix.ethereum.org
  • Faucet AVAX: https://faucet.avax.network/
  • Explorer: https://testnet.snowtrace.io
`)
}

function runTests() {
  console.log(`
🧪 EJECUTANDO VERIFICACIONES MVP...

Verificando archivos de contratos...`)
  
  const kofiExists = fs.existsSync('./contracts/KofiCoin.sol')
  const lotteryExists = fs.existsSync('./contracts/KoquifiLottery.sol')
  const libExists = fs.existsSync('./lib/contracts.ts')
  const panelExists = fs.existsSync('./components/ui/BlockchainTestPanel.tsx')
  
  console.log(`
📁 Archivos de contratos:
  ${kofiExists ? '✅' : '❌'} contracts/KofiCoin.sol
  ${lotteryExists ? '✅' : '❌'} contracts/KoquifiLottery.sol
  ${libExists ? '✅' : '❌'} lib/contracts.ts
  ${panelExists ? '✅' : '❌'} components/ui/BlockchainTestPanel.tsx

📦 Verificando package.json...`)
  
  try {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
    const hasEthers = pkg.dependencies?.ethers
    const hasLucide = pkg.dependencies?.['-react']
    
    console.log(`
📦 Dependencias:
  ${hasEthers ? '✅' : '❌'} ethers
  ${hasLucide ? '✅' : '❌'} lucide-react

${kofiExists && lotteryExists && libExists && panelExists && hasEthers ? 
'🎉 MVP CONFIGURADO CORRECTAMENTE!' : 
'⚠️  Faltan algunos archivos o dependencias'}`)

  } catch (error) {
    console.log('❌ Error verificando package.json')
  }
}

// Procesar comandos
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'update':
    if (args.length < 3) {
      console.error('❌ Uso: node mvp-setup.js update [kofi_address] [lottery_address]')
      process.exit(1)
    }
    updateAddresses(args[1], args[2])
    break
    
  case 'deploy':
  case 'guide':
    showDeploymentGuide()
    break
    
  case 'test':
  case 'verify':
    runTests()
    break
    
  case 'help':
    console.log(`
🎯 Configurador MVP KoquiFi

Comandos:
  node mvp-setup.js              # Mostrar estado actual
  node mvp-setup.js update       # Actualizar direcciones
  node mvp-setup.js guide        # Guía de despliegue
  node mvp-setup.js test         # Verificar configuración
`)
    break
    
  default:
    showCurrentStatus()
}

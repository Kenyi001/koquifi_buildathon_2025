# Guía de Despliegue de Contratos

Esta carpeta contiene los contratos inteligentes para la plataforma Koquifi.

## Contratos Incluidos

### 1. KofiCoin.sol
Token ERC-20 para la plataforma con las siguientes características:
- Símbolo: KOFI
- Nombre: KofiCoin
- Suministro inicial: 1,000,000 tokens
- Suministro máximo: 10,000,000 tokens
- Funcionalidades: mint, burn, pause/unpause

### 2. KoquifiLottery.sol
Contrato de lotería descentralizada:
- Precio del boleto: 0.001 ETH/AVAX
- 6 números del 1 al 49
- Sorteos diarios automáticos
- Distribución de premios por coincidencias

## Instrucciones de Despliegue

### Usando Remix IDE (Recomendado para pruebas)

1. Ve a [https://remix.ethereum.org](https://remix.ethereum.org)
2. Crea una nueva carpeta llamada "koquifi-contracts"
3. Copia el contenido de KofiCoin.sol y KoquifiLottery.sol
4. Instala las dependencias de OpenZeppelin:
   - Ve a "File Explorer" > "contracts" > ".deps"
   - Busca "@openzeppelin/contracts" en GitHub Plugin
5. Compila los contratos
6. Conecta MetaMask a la red de prueba (Avalanche Fuji o Ethereum Sepolia)
7. Despliega primero KofiCoin, luego KoquifiLottery

### Usando Hardhat (Para desarrollo avanzado)

```bash
# Instalar dependencias
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts

# Inicializar Hardhat
npx hardhat init

# Configurar redes en hardhat.config.js
# Desplegar contratos
npx hardhat run scripts/deploy.js --network fuji
```

## Direcciones de Contratos Desplegados

Una vez desplegados, actualiza las direcciones en `/lib/contracts.ts`:

```typescript
const CONTRACT_ADDRESSES = {
  // Avalanche Fuji Testnet
  43113: {
    KOFICOIN: '0xTU_DIRECCION_KOFICOIN_AQUI',
    LOTTERY: '0xTU_DIRECCION_LOTTERY_AQUI'
  },
  // Ethereum Sepolia
  11155111: {
    KOFICOIN: '0xTU_DIRECCION_KOFICOIN_AQUI',
    LOTTERY: '0xTU_DIRECCION_LOTTERY_AQUI'
  }
}
```

## Pasos Posteriores al Despliegue

1. **Verificar contratos** en el explorador de bloques
2. **Configurar minters** para KofiCoin si es necesario
3. **Probar funcionalidades** usando el panel de pruebas de la aplicación
4. **Fondear la lotería** con algunos tokens iniciales

## Redes de Prueba Soportadas

### Avalanche Fuji
- Chain ID: 43113
- RPC: https://api.avax-test.network/ext/bc/C/rpc
- Explorador: https://testnet.snowtrace.io
- Faucet: https://faucet.avax.network/

### Ethereum Sepolia
- Chain ID: 11155111
- RPC: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- Explorador: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com/

## Seguridad

⚠️ **IMPORTANTE**: Estos contratos son para PROPÓSITOS DE PRUEBA únicamente.
Para producción, se recomienda:
- Auditoría de seguridad profesional
- Implementar pausas de emergencia
- Usar oráculos seguros para aleatoriedad
- Implementar límites de gas y tiempo

## Soporte

Si encuentras problemas durante el despliegue:
1. Verifica que tienes fondos suficientes en la red de prueba
2. Confirma que estás en la red correcta en MetaMask
3. Revisa la consola del navegador para errores
4. Consulta la documentación de OpenZeppelin para los contratos base

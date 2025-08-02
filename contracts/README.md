# Contratos Inteligentes de KoquiFI

Este directorio contiene todos los contratos inteligentes que componen el ecosistema DeFi de KoquiFI, diseñado específicamente para jóvenes bolivianos.

## 🏗️ Arquitectura del Sistema

KoquiFI está compuesto por 5 contratos principales que trabajan en conjunto:

```
🪙 KoquiCoin (ERC20)
├── Función de burn hiperbólica
├── Control de acceso (mint/burn)
└── Suministro inicial: 100M tokens

🎫 KoquiTicketNFT (ERC721)
├── Representación de tickets de lotería
├── Metadata on-chain con números
└── Gestión de semanas

🎰 KoquiStaking (Sistema de Lotería)
├── Integración Chainlink VRF
├── Sorteos automáticos semanales
├── Distribución de premios
└── Burn del 5% del pool

💱 KoquiDEX (Exchange Descentralizado)
├── Integración con Trader Joe
├── Swap USDT.e ↔ KOQUI
├── Liquidez automática
└── Fees configurables

📊 KoquiPriceOracle (Oracle de Precios)
├── Integración Chainlink Price Feeds
├── Múltiples fuentes de precio
├── Modo de emergencia
└── Agregación ponderada
```

## 📋 Contratos Detallados

### 1. KoquiCoin.sol
**Token ERC20 principal del ecosistema**

- **Símbolo**: KOQUI
- **Decimales**: 18
- **Supply Inicial**: 100,000,000 KOQUI
- **Supply Mínimo**: 1,000,000 KOQUI (para evitar deflación extrema)

**Características principales:**
- ✅ Función de burn hiperbólica única
- ✅ Control de acceso con roles (MINTER, BURNER, PAUSER)
- ✅ Pausable en emergencias
- ✅ Compatible con OpenZeppelin

**Función Matemática de Burn:**
```solidity
// Límite de burn hiperbólico
burnLimit = (currentSupply - MIN_SUPPLY) / ln(currentSupply / MIN_SUPPLY)
```

### 2. KoquiTicketNFT.sol
**NFTs que representan tickets de lotería**

- **Estándar**: ERC721
- **Nombre**: KoquiFI Lottery Ticket
- **Símbolo**: KOQUITICKET

**Características principales:**
- ✅ Metadata on-chain con números de lotería
- ✅ Gestión de semanas automática
- ✅ Validación de números (1-50, sin duplicados)
- ✅ Generación de URI en Base64
- ✅ Sistema de reclamación de premios

**Estructura del Ticket:**
```json
{
  "name": "KoquiFI Lottery Ticket #123",
  "description": "Ticket de lotería semanal de KoquiFI",
  "image": "data:image/svg+xml;base64,...",
  "attributes": [
    {"trait_type": "Week", "value": "15"},
    {"trait_type": "Numbers", "value": "[5, 12, 23, 34, 45]"},
    {"trait_type": "Purchase Date", "value": "2025-01-15T10:30:00Z"}
  ]
}
```

### 3. KoquiStaking.sol
**Sistema de lotería con Chainlink VRF**

**Características principales:**
- ✅ Sorteos semanales automáticos
- ✅ Chainlink VRF para números aleatorios
- ✅ Chainlink Automation para ejecución automática
- ✅ Distribución de premios en 3 niveles
- ✅ Burn automático del 5% del pool

**Mecánica de Premios:**
- 🥇 **5 números**: 50% del pool
- 🥈 **4 números**: 30% del pool  
- 🥉 **3 números**: 20% del pool
- 🔥 **Burn**: 5% del pool total

**Automatización:**
- ⏰ Sorteos cada lunes a las 00:00 UTC
- 🎲 Números aleatorios de Chainlink VRF
- 🔄 Inicio automático de nueva semana

### 4. KoquiDEX.sol
**Exchange descentralizado con Trader Joe**

**Características principales:**
- ✅ Swap USDT.e ↔ KOQUI
- ✅ Integración nativa con Trader Joe
- ✅ Mint/Burn directo basado en oracle
- ✅ Pool de liquidez automatizado
- ✅ Fees configurables (0.3% por defecto)

**Tipos de Swap:**
1. **Mint Directo**: USDT.e → KOQUI (basado en oracle)
2. **Burn Directo**: KOQUI → USDT.e (basado en oracle)
3. **Pool Trader Joe**: Swap tradicional AMM

**Configuración:**
- 💰 Fee: 0.3% (configurable)
- 🎯 Slippage máximo: 10%
- 📊 Oracle: Chainlink USDT/USD
- 🔄 Router: Trader Joe V2

### 5. KoquiPriceOracle.sol
**Oracle agregado de precios múltiples**

**Características principales:**
- ✅ Integración Chainlink Price Feeds
- ✅ Múltiples fuentes de precio
- ✅ Precios de respaldo (fallback)
- ✅ Modo de emergencia
- ✅ Validación de desviación de precios

**Activos Soportados:**
- 💵 USDT/USD
- ⚡ AVAX/USD
- 🪙 KOQUI/USD (calculado)

**Configuración de Seguridad:**
- ⏰ Heartbeat máximo: 1 hora
- 📊 Desviación máxima: 10%
- 🚨 Modo emergencia disponible
- 🔍 Validación de staleness

## 🚀 Deployment y Configuración

### 1. Compilación
```bash
npm run compile
```

### 2. Deployment en Fuji
```bash
npm run deploy
```

### 3. Configuración post-deployment
```bash
npx hardhat run scripts/setup.js --network fuji
```

### 4. Verificación de contratos
```bash
# Los comandos específicos se generan automáticamente en el deployment
npx hardhat verify --network fuji <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 🔗 Integraciones Externas

### Chainlink Services
- **VRF Coordinator**: `0x2eD832Ba664535e5886b75D64C46EB9a228C2610`
- **Automation Registry**: `0x819B58A646CDd8289275A87653a2aA4902b14fe6`
- **USDT/USD Feed**: `0x7898AcCC83587C3C55116c5230C17a6d441077C9`
- **AVAX/USD Feed**: `0x5498BB86BC934c8D34FDA08E81D444153d0D06aD`

### Trader Joe
- **Router V2**: `0x2D99ABD9008Dc933ff5c0CD271B88309593aB921`
- **USDT.e Token**: `0x50b7545627a5162F82A992c33b87aDc75187B218`

## 🛡️ Seguridad

### Controles Implementados
- ✅ **ReentrancyGuard**: Protección contra ataques de reentrancia
- ✅ **AccessControl**: Gestión granular de permisos
- ✅ **Pausable**: Capacidad de pausar en emergencias
- ✅ **SafeERC20**: Transferencias seguras de tokens
- ✅ **Validation**: Validación exhaustiva de inputs

### Roles y Permisos
```solidity
// KoquiCoin
DEFAULT_ADMIN_ROLE    // Admin principal
MINTER_ROLE          // Puede mintear tokens (DEX, Staking)
BURNER_ROLE          // Puede quemar tokens (DEX, Staking)
PAUSER_ROLE          // Puede pausar contratos

// KoquiStaking
OPERATOR_ROLE        // Operaciones del staking
VRF_COORDINATOR      // Solo Chainlink VRF

// KoquiDEX
OPERATOR_ROLE        // Operaciones del DEX
LIQUIDITY_MANAGER    // Gestión de liquidez

// KoquiPriceOracle
ORACLE_UPDATER_ROLE  // Actualización de precios
PRICE_MANAGER_ROLE   // Gestión de feeds
```

## 📊 Gas Estimations (Fuji Testnet)

| Operación | Gas Estimado | Costo (AVAX) |
|-----------|-------------|---------------|
| Deploy KoquiCoin | ~2,500,000 | ~0.05 AVAX |
| Deploy KoquiStaking | ~3,800,000 | ~0.076 AVAX |
| Deploy KoquiDEX | ~4,200,000 | ~0.084 AVAX |
| Buy Ticket | ~150,000 | ~0.003 AVAX |
| Weekly Draw | ~300,000 | ~0.006 AVAX |
| Swap USDT→KOQUI | ~180,000 | ~0.0036 AVAX |

## 🧪 Testing

### Ejecutar pruebas
```bash
npm test
```

### Cobertura de pruebas
```bash
npm run coverage
```

### Tests implementados
- ✅ Unit tests para cada contrato
- ✅ Integration tests entre contratos
- ✅ Scenarios de uso completos
- ✅ Edge cases y validaciones
- ✅ Gas optimization tests

## 📝 Eventos Principales

### KoquiCoin
```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event Approval(address indexed owner, address indexed spender, uint256 value);
event HyperbolicBurn(address indexed burner, uint256 amount, uint256 newSupply);
```

### KoquiStaking
```solidity
event TicketPurchased(address indexed buyer, uint256 indexed ticketId, uint256[5] numbers);
event WeeklyDraw(uint256 indexed week, uint256[5] winningNumbers, uint256 prizePool);
event PrizeWon(address indexed winner, uint256 indexed ticketId, uint8 matchCount, uint256 prize);
```

### KoquiDEX
```solidity
event SwapUSDTForKoqui(address indexed user, uint256 usdtIn, uint256 koquiOut, uint256 fee);
event SwapKoquiForUSDT(address indexed user, uint256 koquiIn, uint256 usdtOut, uint256 fee);
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear branch feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Add nueva característica'`)
4. Push al branch (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](../LICENSE) para detalles.

## 🔗 Enlaces Útiles

- 🌐 [Avalanche Fuji Explorer](https://testnet.snowtrace.io)
- 🔗 [Chainlink Fuji Docs](https://docs.chain.link/docs/avalanche-price-feeds/)
- 🥤 [Trader Joe Docs](https://docs.traderjoexyz.com/)
- 📚 [Hardhat Documentation](https://hardhat.org/docs)
- 🛡️ [OpenZeppelin Contracts](https://openzeppelin.com/contracts/)

# 📋 Planificación de Contratos Inteligentes - KoquiFI

## 🎯 Contratos Necesarios

### 1. **KoquiCoin.sol** (Token Principal ERC20)
**Propósito**: Token principal de la plataforma KoquiFI
- **Símbolo**: KOQUI
- **Decimales**: 18
- **Funcionalidades**:
  - Mint/Burn controlado por roles
  - Integración con OpenZeppelin AccessControl
  - Pausable para emergencias
  - Funciones de swap con USDT.e

```solidity
// Funciones principales
function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE)
function burn(uint256 amount) external
function pause() external onlyRole(PAUSER_ROLE)
function unpause() external onlyRole(PAUSER_ROLE)
```

### 2. **KoquiStaking.sol** (Sistema de Sorteo Semanal)
**Propósito**: Maneja el sistema gamificado de staking semanal
- **Funcionalidades**:
  - Compra de tickets con KOQUICOIN
  - Sorteos automáticos con Chainlink VRF
  - Distribución de premios
  - Gestión de pools semanales

```solidity
// Funciones principales
function buyTicket(uint256[] memory numbers) external payable
function requestRandomWords() external onlyRole(KEEPER_ROLE)
function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override
function claimPrize(uint256 weekId) external
```

### 3. **KoquiTicketNFT.sol** (Tickets como NFTs)
**Propósito**: Cada ticket es un NFT único con metadata
- **Estándar**: ERC721
- **Funcionalidades**:
  - Mint automático al comprar ticket
  - Metadata con números y semana
  - Transferible entre usuarios
  - Integración con marketplaces

```solidity
// Funciones principales
function mintTicket(address to, uint256[] memory numbers, uint256 week) external onlyRole(MINTER_ROLE)
function tokenURI(uint256 tokenId) public view override returns (string memory)
function getTicketNumbers(uint256 tokenId) external view returns (uint256[] memory)
```

### 4. **KoquiDEX.sol** (Exchange Descentralizado)
**Propósito**: Maneja intercambios entre USDT.e y KOQUICOIN
- **Funcionalidades**:
  - Swap USDT.e ↔ KOQUICOIN
  - Integración con Trader Joe
  - Oráculos de precios con Chainlink
  - Protección contra slippage

```solidity
// Funciones principales
function swapUSDTForKoqui(uint256 usdtAmount, uint256 minKoquiOut) external
function swapKoquiForUSDT(uint256 koquiAmount, uint256 minUSDTOut) external
function getExchangeRate() external view returns (uint256)
function addLiquidity(uint256 usdtAmount, uint256 koquiAmount) external
```

### 5. **KoquiPriceOracle.sol** (Oráculos de Precios)
**Propósito**: Obtiene precios actualizados de Chainlink
- **Funcionalidades**:
  - Precios USDT/USD, AVAX/USD
  - Conversiones BOB/USD (si disponible)
  - Validación de precios
  - Protección contra manipulación

```solidity
// Funciones principales
function getLatestPrice(address priceFeed) external view returns (int256)
function getUSDTPrice() external view returns (uint256)
function getAVAXPrice() external view returns (uint256)
function getBOBPrice() external view returns (uint256) // Si disponible
```

## 🔄 Flujo de Interacción Entre Contratos

```
Usuario (BOB off-chain) 
    ↓
[KoquiDEX] USDT.e → KOQUICOIN
    ↓
[KoquiStaking] KOQUICOIN → Comprar Ticket
    ↓
[KoquiTicketNFT] Mint NFT del Ticket
    ↓
[Chainlink VRF] Sorteo Semanal Automático
    ↓
[KoquiStaking] Distribución de Premios
    ↓
[KoquiDEX] KOQUICOIN → USDT.e (opcional)
```

## 🛠️ Integraciones Externas Requeridas

### Chainlink (Avalanche Fuji)
- **VRF Coordinator**: `0x2eD832Ba664535e5886b75D64C46EB9a228C2610`
- **Key Hash**: `0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61`
- **USDT/USD Price Feed**: TBD (verificar disponibilidad en Fuji)
- **AVAX/USD Price Feed**: TBD

### Trader Joe (Avalanche)
- **Router V2**: Integración para liquidez USDT.e/KOQUICOIN
- **Factory**: Para crear/gestionar pares de trading

### OpenZeppelin
- **ERC20**: Base para KoquiCoin
- **ERC721**: Base para KoquiTicketNFT
- **AccessControl**: Sistema de roles
- **Pausable**: Funcionalidad de pausa de emergencia
- **ReentrancyGuard**: Protección contra reentrancy

## 📅 Orden de Desarrollo Sugerido

### Fase 1: Contratos Base
1. **KoquiCoin.sol** - Token principal
2. **KoquiPriceOracle.sol** - Oráculos de precios
3. **KoquiTicketNFT.sol** - NFTs de tickets

### Fase 2: Funcionalidad Core
4. **KoquiDEX.sol** - Exchange básico
5. **KoquiStaking.sol** - Sistema de sorteos

### Fase 3: Integración y Testing
6. Integración completa entre contratos
7. Tests exhaustivos
8. Deploy en Fuji Testnet
9. Frontend integration

## 🔐 Consideraciones de Seguridad

- **Reentrancy Protection**: Usar OpenZeppelin ReentrancyGuard
- **Access Control**: Roles claramente definidos
- **Price Oracle Validation**: Verificar freshness de precios
- **Slippage Protection**: Límites en swaps
- **Emergency Pause**: Capacidad de pausar en emergencias
- **Audit**: Revisar contratos antes de mainnet

## 📝 Variables de Entorno Necesarias

```env
# Direcciones de Contratos
KOQUICOIN_ADDRESS=0x...
KOQUI_STAKING_ADDRESS=0x...
KOQUI_TICKET_NFT_ADDRESS=0x...
KOQUI_DEX_ADDRESS=0x...
KOQUI_ORACLE_ADDRESS=0x...

# Chainlink
VRF_COORDINATOR_ADDRESS=0x2eD832Ba664535e5886b75D64C46EB9a228C2610
VRF_KEY_HASH=0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61
VRF_SUBSCRIPTION_ID=your_subscription_id

# Trader Joe
TRADER_JOE_ROUTER_ADDRESS=0x...
TRADER_JOE_FACTORY_ADDRESS=0x...

# Tokens Externos
USDT_E_ADDRESS=0x... # USDT.e en Avalanche Fuji
```

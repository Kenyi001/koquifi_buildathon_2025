# Setup del Backend KoquiFI - Guía de Inicio

## ✅ Lo que hemos configurado

### 1. Estructura del Proyecto
```
/koquifi-backend
├── contracts/           # Contratos Solidity (Hardhat)
├── src/
│   ├── config/         # Configuración y variables de entorno
│   ├── controllers/    # Controladores de rutas
│   ├── routes/         # Definición de rutas Express
│   ├── services/       # Servicios de blockchain con ethers.js
│   ├── models/         # Modelos de base de datos (pendiente)
│   └── index.js        # Servidor Express principal
├── scripts/            # Scripts de deploy Hardhat
├── test/               # Pruebas unitarias
├── hardhat.config.js   # Configuración Hardhat
├── package.json        # Dependencias y scripts
├── .env                # Variables de entorno
└── .env.example        # Ejemplo de configuración
```

### 2. Tecnologías Instaladas y Configuradas
- **Node.js** con Express 4.18.2
- **Hardhat** para desarrollo de contratos
- **ethers.js** v6 para interacción con blockchain
- **dotenv** para manejo de variables de entorno
- **Middleware de seguridad**: CORS, Helmet, Morgan, Compression
- **Configuración para Avalanche Fuji Testnet**

### 3. Endpoints Activos
- `GET /` - Información básica de la API
- `GET /health` - Health check del servidor
- `GET /api/blockchain/network` - Información de la red blockchain
- `GET /api/blockchain/balance/:address` - Balance AVAX de una dirección
- `GET /api/blockchain/transaction/:txHash` - Detalles de transacción
- `GET /api/blockchain/validate/:address` - Validar dirección Ethereum

### 4. Scripts Disponibles
```bash
npm start        # Ejecutar servidor en producción
npm run dev      # Ejecutar servidor en desarrollo (nodemon)
npm run compile  # Compilar contratos Solidity
npm run deploy   # Desplegar contratos en Fuji
npm test         # Ejecutar pruebas unitarias
npm run node     # Iniciar nodo local Hardhat
```

## 🚀 Cómo empezar a desarrollar

### 1. Probar el servidor actual
El servidor está corriendo en: **http://localhost:3000**

Puedes probar estos endpoints:
- **http://localhost:3000/api/blockchain/network** - Info de Avalanche Fuji
- **http://localhost:3000/health** - Estado del servidor

### 2. Configurar tu wallet (opcional para transacciones)
Para habilitar transacciones, necesitas configurar una clave privada:

1. Crea una wallet en MetaMask o similar
2. Obtén AVAX de prueba del faucet: https://faucet.avax.network/
3. Agrega tu clave privada en `.env`:
   ```
   PRIVATE_KEY=0x1234567890abcdef...
   ```

### 3. Próximos pasos sugeridos

#### A. Desarrollar Contratos Inteligentes
1. **KoquiCoin Token (ERC20)**
   - Crear contrato en `contracts/KoquiCoin.sol`
   - Implementar funciones de mint/burn
   - Integrar con OpenZeppelin

2. **Staking Contract**
   - Sistema de tickets para sorteo semanal
   - Integración con Chainlink VRF para sorteos
   - Automatización con Chainlink Keepers

3. **Swap Contract**
   - Integración con Trader Joe Router
   - Funciones de intercambio USDT.e ↔ KOQUICOIN

#### B. Expandir la API
1. **Rutas de Tickets**
   - `POST /api/tickets/buy` - Comprar ticket
   - `GET /api/tickets/user/:address` - Tickets de usuario
   - `GET /api/draw/current` - Sorteo actual

2. **Rutas de Swap**
   - `POST /api/swap` - Realizar intercambio
   - `GET /api/swap/rate` - Obtener tasa de cambio

3. **Rutas de Usuario**
   - `POST /api/users/register` - Registrar usuario
   - `GET /api/users/:address` - Info de usuario

#### C. Base de Datos
Agregar persistencia con MongoDB o PostgreSQL:
```bash
# Para MongoDB
npm install mongoose

# Para PostgreSQL  
npm install pg sequelize
```

## 📝 Notas Importantes

### Configuración de Red
- **Red actual**: Avalanche Fuji Testnet (ChainID: 43113)
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://subnets-test.avax.network/c-chain

### Chainlink en Fuji
- **VRF Coordinator**: 0x2eD832Ba664535e5886b75D64C46EB9a228C2610
- **Key Hash**: 0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61

### Comandos Útiles
```bash
# Compilar contratos
npx hardhat compile

# Desplegar en Fuji
npx hardhat run scripts/deploy.js --network fuji

# Verificar contrato en explorer
npx hardhat verify --network fuji <address> <constructor-args>

# Iniciar consola de Hardhat
npx hardhat console --network fuji
```

## 🐛 Troubleshooting

### Error de clave privada
Si ves errores de "invalid BytesLike value":
- Verifica que PRIVATE_KEY en .env sea una clave válida de 64 caracteres hex
- O déjala como 'your_private_key_here' para modo solo lectura

### Error de conexión a red
- Verifica que tengas conexión a internet
- Confirma que FUJI_RPC_URL esté configurada correctamente

### El servidor no inicia
- Verifica que el puerto 3000 esté libre
- Ejecuta `npm install` para asegurar las dependencias

## 📚 Recursos Útiles
- [Documentación Hardhat](https://hardhat.org/docs)
- [Documentación ethers.js](https://docs.ethers.org/)
- [Avalanche Fuji Testnet](https://docs.avax.network/build/dapp/fuji-test-network)
- [Chainlink VRF](https://docs.chain.link/vrf)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

# 🪙 KokiFI - DeFi para Jóvenes Bolivianos

**KokiFI** es una plataforma DeFi gamificada diseñada específicamente para jóvenes bolivianos, combinando educación financiera, staking, y un sistema de lotería semanal en la blockchain de Avalanche.

## 🎯 Visión

Democratizar el acceso a las finanzas descentralizadas (DeFi) para los jóvenes bolivianos a través de una plataforma educativa, segura y divertida que combina inversión con gamificación.

## ⭐ Características Principales

### 🪙 Token KOKICOIN (KOKI)
- **Burn Hiperbólico**: Función matemática única que reduce el supply de forma controlada
- **Supply Inicial**: 100,000,000 KOKI
- **Supply Mínimo**: 1,000,000 KOKI (protección contra deflación extrema)
- **Utility**: Staking, pagos, premios de lotería

### 🎰 Sistema de Lotería Semanal
- **Mecánica**: Cada lunes sorteo automático con Chainlink VRF
- **Tickets**: NFTs ERC721 con números únicos (1-50)
- **Premios**: Distribución en 3 niveles (5, 4, 3 números correctos)
- **Burn**: 5% del pool de premios se quema automáticamente

### 💱 Exchange Descentralizado (DEX)
- **Pares**: USDT.e ↔ KOKICOIN
- **Integración**: Trader Joe para liquidez
- **Mint/Burn**: Directo basado en oracle de precios
- **Fees**: 0.3% configurables

### 📊 Oracle de Precios
- **Fuentes**: Chainlink Price Feeds múltiples
- **Activos**: USDT, AVAX, KOQUI
- **Seguridad**: Validación de staleness y desviación
- **Fallback**: Precios de respaldo en emergencias
* Swap descentralizado entre **USDT.e** y **KOKICOIN** usando Trader Joe
* API RESTful construida con **Node.js**, **Express** y **ethers.js**
* Automatización de sorteos con **Chainlink Automation (Keepers)**

## Tecnologías

* **Node.js** 18+
* **Express**
* **Hardhat** + **ethers.js**
* **MongoDB** o **PostgreSQL** (opcional para persistencia)
* **Chainlink VRF & Price Feeds**
* **Avalanche Fuji Testnet**

## Requisitos

* Git
* Node.js >=18.x
* npm o yarn
* Acceso a Avalanche Fuji y clave privada para deploy

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-org/koquifi-backend.git
cd koquifi-backend

# Instalar dependencias
npm install
```

## Configuración

1. Copia `.env.example` a `.env`:

   ```bash
   cp .env.example .env
   ```
2. Rellena las variables en `.env`:

   ```dotenv
   FUJI_RPC_URL=<URL_RPC_FUJI>
   PRIVATE_KEY=<TU_LLAVE_PRIVADA>
   STAKING_ADDRESS=<DIRECCIÓN_DEL_CONTRATO_STAKING>
   MONGODB_URI=<URI_DE_MONGODB>  # o DATABASE_URL para SQL
   PORT=3000
   ```

## Estructura del proyecto

```
/koquifi-backend
├─ contracts/           # Contratos Solidity
├─ scripts/             # Scripts de deploy Hardhat
├─ artifacts/           # Artefactos compilados (auto)
├─ src/
│  ├─ config/           # Carga de .env y ajustes generales
│  ├─ controllers/      # Lógica de controladores de rutas
│  ├─ routes/           # Definición de rutas Express
│  ├─ services/         # Integración con ethers.js y contratos
│  ├─ models/           # Modelos de base de datos (Mongoose/Sequelize)
│  └─ index.js          # Inicialización de servidor
├─ hardhat.config.js    # Configuración Hardhat
├─ package.json
├─ .env.example
└─ README.md
```

## Scripts disponibles

* `npm run compile`  – Compila los contratos Solidity
* `npm run deploy`   – Despliega contratos en Fuji
* `npm start`        – Inicia el servidor Express
* `npm run test`     – Ejecuta pruebas unitarias

## Uso

1. Asegúrate de haber configurado y desplegado los contratos (`npm run deploy`).
2. Actualiza `STAKING_ADDRESS` en `.env` con la dirección desplegada.
3. Inicia la API:

   ```bash
   npm start
   ```
4. Prueba los endpoints con curl o Postman:

   ```bash
   POST http://localhost:3000/api/tickets/buy
   Body: { "userAddress": "0x..", "numbers": [1,2,3,4,5] }
   ```

## Endpoints Principales

| Método | Ruta                  | Descripción                              |
| ------ | --------------------- | ---------------------------------------- |
| POST   | `/api/tickets/buy`    | Compra un ticket de staking              |
| POST   | `/api/swap`           | Intercambia USDT.e ↔ KOQUICOIN            |
| POST   | `/api/users/register` | Registra un nuevo usuario                |
| POST   | `/api/draw`           | Inicia manualmente el sorteo semanal     |
| GET    | `/api/results/:week`  | Obtiene resultados del sorteo por semana |

## Testing

Agrega tus pruebas en `test/` y usa:

```bash
npm run test
```

## Contribuir

1. Haz un fork del repositorio.
2. Crea una rama (`feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit.
4. Abre un Pull Request describiendo tus modificaciones.

## Licencia

MIT © 2025 KoquiFI Team

## Contacto

Para dudas o sugerencias, abre un issue o escríbenos a `koquifi-support@example.com`.

# Documentación oficial para koquiFI
## Documentación de Tecnologías para koquiFI

Como buen ingeniero de sistemas (con una pizca de humor), he reunido la documentación oficial de las tecnologías clave que se utilizarán en el proyecto koquiFI. Para facilitar la navegación, se incluye un índice con enlaces internos; cada sección mantiene los títulos y el texto de la fuente original para que la referencia sea directa.

## Índice

- [Hardhat – Quick Start](#hardhat--quick-start)
- [Hardhat – Testing](#hardhat--testing)
- [Solidity – Getting Started](#solidity--getting-started)
- [Solidity – Security Considerations](#solidity--security-considerations)
- [OpenZeppelin Contracts – ERC20](#openzeppelin-contracts--erc20)
- [OpenZeppelin Contracts – Access Control](#openzeppelin-contracts--access-control)
- [Chainlink – VRF](#chainlink--vrf)
- [Chainlink – Automation (Keepers)](#chainlink--automation-keepers)
- [Chainlink – Price Feeds](#chainlink--price-feeds)
- [Avalanche Fuji Testnet](#avalanche-fuji-testnet)
- [eERC (Encrypted ERC)](#eerc-encrypted-erc)
- [Trader Joe – Router](#trader-joe--router)
- [Web3Auth (Onboarding Wallet-as-a-Service)](#web3auth-onboarding-wallet-as-a-service)
- [MongoDB – Conexión y Buffering](#mongodb--conexión-y-buffering)
- [PostgreSQL – Conexiones y Tipos](#postgresql--conexiones-y-tipos)
- [ethers.js – Guía de inicio v6](#ethersjs--guía-de-inicio-v6)
- [ethers.js – Guía de inicio v5](#ethersjs--guía-de-inicio-v5)

---

## Hardhat – Quick Start

La guía rápida de Hardhat comienza señalando que, para utilizar la instalación local de Hardhat, debes ejecutar `npx`. Tras instalar el paquete con tu gestor favorito (npm/yarn/pnpm), se recomienda usar `npx hardhat init` para crear un proyecto de ejemplo ([hardhat.org](https://hardhat.org)). Este comando inicializa un proyecto con una estructura básica y presenta un menú interactivo donde puedes elegir entre proyectos en JavaScript o TypeScript.

Una vez creado el proyecto, la documentación sugiere ejecutar `npx hardhat` para ver las tareas disponibles. Este comando muestra la versión de Hardhat, las opciones globales (por ejemplo `--config`, `--network`, `--verbose`) y una lista de tareas que incluyen `compile`, `console`, `coverage`, `flatten`, `node`, `test` y `verify`, entre otras. Para obtener ayuda sobre una tarea específica se recomienda `npx hardhat help [task]`.

La guía también incluye un contrato de muestra denominado `Lock.sol` ubicado en el directorio `contracts/`. Este contrato define una variable `unlockTime`, almacena el propietario y permite retirar fondos solo después de la fecha de desbloqueo. Para compilarlo basta ejecutar `npx hardhat compile`.

---

## Hardhat – Testing

El proyecto de ejemplo incluye un conjunto de pruebas escritas con Mocha, Chai, Ethers.js y Hardhat Ignition ([hardhat.org](https://hardhat.org)). En la carpeta `test/` encontrarás un archivo que utiliza funciones como `time`, `loadFixture` y `expect` para crear un fixture de despliegue, simular el paso del tiempo y verificar el comportamiento del contrato. Las pruebas comprueban que:

- El constructor establece correctamente la variable `unlockTime` y asigna el propietario.
- El contrato almacena el monto bloqueado y revierte si el tiempo de desbloqueo no está en el futuro.
- Las funciones de retiro se comportan como se espera: revierten si se llaman antes de tiempo o desde otra cuenta, emiten un evento `Withdrawal` al retirar y transfieren los fondos correctamente al propietario.

Las pruebas usan la función `loadFixture` para reutilizar el estado entre casos y demuestran técnicas como aumentar el tiempo en la red local (`time.increaseTo`) y conectar un contrato con otra cuenta (`lock.connect(otherAccount)`).

---

## Solidity – Getting Started

La documentación oficial de Solidity sugiere varios pasos para comenzar. Primero debes comprender los conceptos básicos de los contratos inteligentes, revisando la introducción, un ejemplo simple y los fundamentos de Blockchain y Ethereum Virtual Machine (EVM) ([docs.soliditylang.org](https://docs.soliditylang.org)). Una vez entendido esto, recomienda leer las secciones **Solidity by Example** y **Language Description** para familiarizarte con las características del lenguaje.

Luego se debe instalar el compilador de Solidity; existen diversas opciones y se puede elegir la que mejor se adapte a tu entorno. Para experimentar rápidamente, puedes utilizar el **Remix IDE**, que permite escribir, desplegar y administrar contratos directamente en el navegador. Finalmente, la documentación advierte que todo software tiene errores y que es esencial seguir buenas prácticas de desarrollo, realizar revisiones de código y auditorías antes de desplegar en producción.

---

## Solidity – Security Considerations

El apartado de consideraciones de seguridad advierte que toda la información de un contrato inteligente es pública, incluso variables marcadas como `private`; además, generar números aleatorios de forma segura en cadena es complicado ([docs.soliditylang.org](https://docs.soliditylang.org)). Otra advertencia importante es la **reentrancy**: al transferir Ether a otro contrato se entrega control a ese contrato, lo que podría permitir que llame de vuelta antes de finalizar la operación. Se recomienda implementar el patrón **Checks-Effects-Interactions** para prevenir ataques de reentrancia.

Se destacan otros peligros:

- **Límites de gas y bucles**: los bucles con número de iteraciones no fijo pueden exceder el límite de gas y bloquear la ejecución.
- **Envío y recepción de Ether**: los contratos no pueden evitar recibir Ether; al recibirlo se ejecutan las funciones `receive` o `fallback`, pero solo disponen de 2300 gas. Para enviar Ether con más gas se debe usar `addr.call{value: x}("")`. El envío puede fallar por profundidad de pila o falta de gas, por lo que se recomienda el patrón de retiro en vez de transferencias directas.
- **Call stack depth**: llamadas externas pueden fallar al exceder la profundidad de pila (1024).
- **Proxies autorizados**: si un contrato actúa como proxy, debe evitar tener privilegios propios para minimizar riesgos.
- **No usar `tx.origin` para autorización**: se muestra un ejemplo de contrato con un bug donde el uso de `tx.origin` permite que un atacante desvíe fondos.

En resumen, la documentación recomienda auditar y revisar los contratos, utilizar patrones de diseño seguros y considerar estos riesgos al escribir código de Solidity.

---

## OpenZeppelin Contracts – ERC20

Un token ERC20 es fungible, es decir, cada token es idéntico a otro y no posee derechos especiales ([docs.openzeppelin.com](https://docs.openzeppelin.com)). La documentación de OpenZeppelin proporciona contratos listos para heredar y crear tokens propios. Un ejemplo de contrato `GLDToken` demuestra cómo heredar de `ERC20`, establecer el nombre y símbolo y acuñar un suministro inicial en el constructor.

El campo `decimals` indica cuántos decimales soporta el token. Para permitir transferir fracciones (por ejemplo 1.5 GLD), se asigna un valor alto de `decimals`. La documentación explica que `decimals` solo afecta la visualización; internamente se siguen utilizando enteros. Por defecto, ERC20 usa 18 decimales, pero se puede sobrescribir la función `decimals()` para usar otro valor.

---

## OpenZeppelin Contracts – Access Control

El control de acceso determina quién puede ejecutar funciones en un contrato. OpenZeppelin ofrece varias estrategias. La forma más simple es el patrón de propietario (Ownable), donde una sola cuenta controla funciones administrativas ([docs.openzeppelin.com](https://docs.openzeppelin.com)). El contrato Ownable incluye funciones para transferir la propiedad a otra cuenta o renunciar a la propiedad, lo que elimina privilegios administrativos. Incluso se puede designar otra entidad (como un Gnosis Safe) como propietario.

Para sistemas más complejos, OpenZeppelin proporciona el sistema de rol basado en permisos (AccessControl). Se definen roles identificados por bytes32 y se otorgan a cuentas específicas. Un ejemplo de token ERC20 con rol de minter muestra cómo crear un identificador MINTER_ROLE, asignarlo en el constructor y verificarlo mediante hasRole antes de acuñar. El mismo patrón se extiende definiendo un rol de quemador (BURNER_ROLE) con funciones mint y burn protegidas por onlyRole. La documentación destaca que esta granularidad implementa el principio de mínimo privilegio, permitiendo que una cuenta tenga varios roles si es necesario.

---

## Chainlink – VRF

Chainlink VRF (Verifiable Random Function) es un generador de números aleatorios verificable que proporciona valores aleatorios y pruebas criptográficas para cada solicitud ([docs.chain.link](https://docs.chain.link)). La prueba se verifica en cadena para asegurar que el resultado no ha sido manipulado por operadores de oráculos, mineros o desarrolladores.

VRF v2.5 ofrece dos métodos para solicitar aleatoriedad:

- **Suscripción**: se crea una cuenta de suscripción y se financia con tokens nativos o LINK. Varias aplicaciones consumidoras pueden compartir la suscripción y los costes se cargan después de cumplir las solicitudes.

- **Financiamiento directo**: cada contrato consumidor paga directamente en el momento de la solicitud. Este método tiene mayor sobrecarga de gas pero no requiere una cuenta de suscripción.

La documentación compara ambas opciones, indicando que la suscripción es adecuada para solicitudes regulares con menor coste de gas, mientras que el financiamiento directo es útil para solicitudes puntuales. Las redes y límites soportados se detallan en la página de redes admitidas.

---

## Chainlink – Automation (Keepers)

La sección general de Chainlink Automation explica que proporciona ejecución descentralizada y fiable de funciones de contratos inteligentes y que solo se admiten los registros v2.1 y posteriores ([docs.chain.link](https://docs.chain.link)). El enfoque es delegar la ejecución a una red de nodos, evitando que los desarrolladores tengan que mantener infraestructuras centralizadas.

En la guía Getting Started with Chainlink Automation, se presentan tres tipos de disparadores:

1. **Time‑based trigger**: se programa una función para ejecutarse según un cron. El usuario se conecta a la aplicación de Chainlink Automation, registra un upkeep, proporciona la dirección del contrato y la función (addInteger en el ejemplo) y especifica la expresión CRON como */5 * * * * para ejecutarla cada 5 minutos.

2. **Custom logic trigger**: se registra un upkeep que evalúa una lógica on‑chain definida en un contrato específico. Se introducen los parámetros de gas y el dato de verificación (checkData) y, tras registrarlo, el upkeep se ejecuta periódicamente.

3. **Log trigger**: se automatiza una función en respuesta a eventos de log. El usuario registra el upkeep proporcionando la dirección del contrato a automatizar, la dirección que emite los eventos y el tipo de log que activará la ejecución.

Cada procedimiento culmina registrando el upkeep y observando su ejecución en la interfaz de Chainlink.

---

## Chainlink – Price Feeds

Los Price Feeds de Chainlink proporcionan datos agregados de múltiples orígenes mediante nodos descentralizados ([docs.chain.link](https://docs.chain.link)). Para utilizar los feeds en cadenas compatibles con la EVM, la guía Using Data Feeds explica que se deben especificar tres variables:

1. **RPC endpoint URL**: determina la red en la que se ejecutará el contrato, pudiendo usarse un proveedor de nodos o un cliente propio.

2. **Dirección del token LINK**: es distinta en cada red; se consultan en la página de contratos de LINK.

3. **Dirección del contrato del feed**: determina qué feed se leerá (p. ej. BTC/USD).

El documento indica que el mismo código funciona en distintas cadenas EVM y muestra ejemplos en Solidity y Vyper de cómo importar AggregatorV3Interface y leer el último valor mediante latestRoundData(). También se presentan ejemplos para leer feeds fuera de cadena con web3.js, Python y Golang.

---

## Avalanche Fuji Testnet

Fuji es la red de pruebas oficial de Avalanche y replica la infraestructura de la red principal. Está compuesta por una Primary Network con las cadenas X, P y C y permite desplegar contratos demo y probar aplicaciones antes de lanzarlas al Mainnet ([build.avax.network](https://build.avax.network)).

Para obtener AVAX de prueba se utiliza el Avalanche Faucet o se solicita un cupón a través de Guild si no se tiene saldo en Mainnet.

Para añadir la C‑Chain de Fuji a una cartera se deben usar los siguientes parámetros:

- Network Name: Avalanche Fuji C‑Chain
- RPC URL: https://api.avax-test.network/ext/bc/C/rpc
- WebSocket URL: wss://api.avax-test.network/ext/bc/C/ws
- ChainID: 43113
- Symbol: AVAX
- Explorer: https://subnets-test.avax.network/c-chain

La página señala además que Fuji tiene un explorador de bloques propio y un servidor API público diferente al de Mainnet, y que operar un validador requiere solo 1 Fuji AVAX.

---

## eERC (Encrypted ERC)

Encrypted ERC (eERC) es un protocolo de tokens que permite transferencias completamente cifradas en cadenas EVM y mantiene el cumplimiento normativo mediante pruebas de conocimiento cero y auditores designados ([docs.avacloud.io](https://docs.avacloud.io)).

### ¿Qué es Encrypted ERC?

La documentación explica que eERC es una implementación de tokens tipo ERC20 orientada a la privacidad. Utiliza técnicas criptográficas para mantener privadas las cantidades transferidas y los saldos, a la vez que permite verificar su corrección. Se destaca que eERC resuelve la tensión entre la transparencia de la cadena y la necesidad de privacidad, permitiendo que empresas o usuarios mantengan privadas sus transacciones. Además, incorpora una función de auditabilidad mediante claves de auditor que permiten a las autoridades designadas revisar transacciones cuando sea necesario.

### Visión general del protocolo

El protocolo eERC combina contratos inteligentes y circuitos de cero conocimiento para lograr confidencialidad. Existe una versión Standalone para crear nuevos tokens privados y una versión Converter que añade privacidad a tokens ERC‑20 existentes.

La versión Standalone permite acuñar y quemar tokens de manera privada, manteniendo la confidencialidad de las operaciones. La versión Converter permite depositar tokens públicos para obtener versiones privadas y retirarlos de vuelta a su forma pública.

El sistema utiliza diferentes circuitos para cada operación (registro, transferencia, acuñación, retiro) y se apoya en la curva BabyJubjub, cifrado ElGamal y Poseidon para asegurar la privacidad y auditabilidad. Las pruebas de conocimiento cero permiten verificar las transacciones sin revelar datos sensibles.

---

## Trader Joe – Router

Debido a cambios en la documentación de Trader Joe, gran parte del contenido se ha trasladado o no está disponible. Sin embargo, el repositorio del Joe Router ofrece una descripción de su contrato.

El Router implementado en este repositorio permite intercambiar tokens mediante rutas predefinidas utilizando DEXes como Uniswap V2, Uniswap V3 y LFJ (antiguamente Trader Joe) ([raw.githubusercontent.com](https://raw.githubusercontent.com)).

El fichero Router.sol es el contrato principal encargado de validar la ruta y ejecutar los intercambios, soportando swaps de entrada exacta y salida exacta. El contrato RouterLogic.sol implementa la lógica de intercambio usando la ruta indicada.

Adicionalmente se incluyen:

- RouterAdapter.sol: funciones auxiliares para interactuar con tipos de pares como Uniswap V2, Liquidity Book legacy y Uniswap V3.
- ForwarderLogic.sol: utilitario que reenvía llamadas a un router externo, eliminando la necesidad de múltiples aprobaciones de tokens y protegiendo al usuario de pagos excesivos.
- Bibliotecas TokenLib, RouterLib, PairInteraction, PackedRoute y Flags que proveen operaciones de tokens, validación de rutas, interacción con pares y decodificación de rutas empaquetadas.

El proyecto se construye con Foundry y está licenciado bajo MIT.

---

## Web3Auth (Onboarding Wallet-as-a-Service)

Web3Auth es una infraestructura de billetera embebida que simplifica la integración de wallets en aplicaciones Web3 y el onboarding de usuarios. Permite iniciar sesión usando OAuth (Google, Twitter, GitHub, etc.) y sistemas sin contraseña, y mantiene a los usuarios en control de sus wallets no custodiales ([web3auth.io](https://web3auth.io)).

### Características clave

- **Autenticación simple**: permite loguearse con redes sociales, correo electrónico, SMS o autenticadores, e incluso integrar tu propio sistema de autenticación sobre su infraestructura.
- **Seguridad de nivel bancario**: utiliza tecnología MPC para dividir las claves entre múltiples partes, arquitectura distribuida sin puntos únicos de fallo y opciones de respaldo múltiples.
- **Diseñado para desarrolladores**: se integra fácilmente en aplicaciones existentes, ofrece control total para personalizar la experiencia y soporta plataformas web, móviles y juegos.
- **Orientado al usuario**: permite a los usuarios empezar en menos de un minuto sin necesidad de conocimientos cripto; los usuarios siempre controlan sus wallets y cuentan con recuperación de cuenta sencilla.

La documentación aclara que Web3Auth no es una wallet en sí, sino una infraestructura que puede integrarse en cualquier aplicación para manejar la gestión de claves y la autenticación. El servicio es escalable, con disponibilidad global, escalado automático y arquitectura distribuida basada en Kubernetes.

---

## MongoDB – Conexión y Buffering

La guía de conexiones de Mongoose explica que puedes conectar a MongoDB usando el método mongoose.connect() ([mongoosejs.com](https://mongoosejs.com)). Para bases de datos locales se recomienda usar 127.0.0.1 en lugar de localhost porque Node 18 y superiores resuelven localhost a IPv6, lo que puede impedir la conexión. También se muestra cómo construir una URI con nombre de usuario, contraseña, host, puerto y opciones adicionales.

Mongoose permite utilizar los modelos inmediatamente aunque la conexión aún no se haya establecido gracias a un mecanismo de buffering de operaciones. Este buffering significa que las llamadas se almacenan hasta que la conexión está disponible. Para desactivar el buffering se puede configurar la opción bufferCommands a false a nivel de esquema o de forma global. La documentación también explica cómo manejar errores de conexión inicial (usando catch o try/catch) y cómo escuchar eventos de error y desconexión en la conexión. Por último, se listan algunas opciones relevantes: maxPoolSize controla el número de sockets en el pool, autoIndex determina si se crean índices automáticamente y dbName especifica la base de datos predeterminada.

---

## PostgreSQL – Conexiones y Tipos

El manual de PostgreSQL describe que la cadena de conexión (conninfo) puede contener uno o más parámetros en la forma keyword=value separados por espacios ([postgresql.org](https://postgresql.org)). Los parámetros más importantes incluyen:

- **host**: nombre del host; si comienza con / indica un socket Unix. Si no se especifica, se conecta a /tmp o a localhost.
- **hostaddr**: dirección IP numérica para evitar la resolución DNS. Cuando se usa con Kerberos se recomienda especificar ambos parámetros.
- **port**: puerto del servidor.
- **dbname**: nombre de la base de datos, por defecto coincide con el nombre de usuario.
- **user y password**: credenciales de autenticación.
- **connect_timeout**: tiempo máximo de espera para conectar en segundos.
- **sslmode**: determina si se negocia una conexión SSL (disable, allow, prefer, require).

La guía de aprendizaje muestra un ejemplo de creación de tablas. Para crear una tabla weather con columnas city, temp_lo, temp_hi, prcp y date, se ejecuta el comando SQL:

```sql
CREATE TABLE weather (
    city            varchar(80),
    temp_lo         int,           -- temperatura mínima
    temp_hi         int,           -- temperatura máxima
    prcp            real,          -- precipitación
    date            date
);
```

El tutorial explica que el espacio en blanco y las mayúsculas no importan, que los comentarios comienzan con -- y que tipos como varchar, int, real y date son estándar. También presenta un ejemplo de tabla cities con un tipo de dato point específico de PostgreSQL y recuerda que se puede eliminar una tabla con DROP TABLE nombre;.

---

## ethers.js – Guía de inicio v6

La guía de Ethers v6 describe cómo instalar el paquete con NPM (npm install ethers) y señala que todos los objetos se exportan desde la raíz del paquete ([docs.ethers.org](https://docs.ethers.org)). La importación puede hacerse de diversas formas: importar todo (import { ethers } from "ethers"), importar elementos específicos (import { BrowserProvider, parseUnits } from "ethers") o importar desde módulos concretos (import { HDNodeWallet } from "ethers/wallet"). También se muestra cómo importar ESM en un navegador usando un CDN.

La documentación define varios conceptos comunes:

- **Provider**: conexión de solo lectura a la cadena; permite consultar cuentas, bloques, transacciones y realizar llamadas de lectura.
- **Signer**: envuelve operaciones que necesitan una clave privada para firmar transacciones; puede ser una wallet en memoria o un proveedor externo como MetaMask.
- **Transaction**: operación que modifica el estado de la cadena y requiere pagar una comisión; incluso si revierte se paga la comisión.
- **Contract**: programa desplegado en la cadena con código y almacenamiento; se puede conectar a un Provider para operaciones de lectura o a un Signer para modificar el estado.
- **Receipt**: cuando una transacción se confirma, el recibo incluye el bloque, la comisión pagada, los eventos emitidos y si tuvo éxito o fue revertida.

Para conectar a Ethereum se emplea un Provider. La guía muestra cómo conectar con MetaMask usando ethers.BrowserProvider(window.ethereum) y obtener un Signer con provider.getSigner(). También explica cómo conectar a un nodo RPC propio usando ethers.JsonRpcProvider(url); si no se especifica URL, se conecta al nodo local (http://localhost:8545).

---

## ethers.js – Guía de inicio v5

La documentación de Ethers v5 enfatiza que la biblioteca busca ser compacta y completa para interactuar con Ethereum. Entre sus características destacan la capacidad de guardar claves privadas en el cliente, importar y exportar wallets JSON y frases mnemónicas, conectar con nodos mediante JSON‑RPC, INFURA, Etherscan, Alchemy o MetaMask, soporte nativo de nombres ENS y un tamaño reducido (~88 kB comprimido) ([docs.ethers.org](https://docs.ethers.org)).

Para instalar la biblioteca basta ejecutar npm install --save ethers. La guía explica cómo importar la biblioteca en Node (const { ethers } = require("ethers");) o en ES6/TypeScript (import { ethers } from "ethers"). También muestra cómo cargar la biblioteca en navegadores mediante módulos ES6 o UMD desde un CDN.

Se define la terminología común: un Provider ofrece acceso de solo lectura al blockchain, un Signer posee una clave privada para firmar transacciones y un Contract es una abstracción que representa un contrato desplegado. La guía describe cómo conectar a MetaMask usando ethers.providers.Web3Provider(window.ethereum) y solicitar permisos, obteniendo un Signer con provider.getSigner(). También explica cómo conectar a un cliente RPC local o a servicios como INFURA mediante ethers.providers.JsonRpcProvider(). Finalmente, la documentación muestra ejemplos de consultas básicas al blockchain, como obtener el número de bloque y el saldo de una cuenta.

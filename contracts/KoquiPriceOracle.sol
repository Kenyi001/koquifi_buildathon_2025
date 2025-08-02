// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title KoquiPriceOracle
 * @dev Oracle de precios para KoquiFI usando Chainlink y múltiples fuentes
 */
contract KoquiPriceOracle is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant ORACLE_UPDATER_ROLE = keccak256("ORACLE_UPDATER_ROLE");
    bytes32 public constant PRICE_MANAGER_ROLE = keccak256("PRICE_MANAGER_ROLE");

    // Estructura para datos de precio
    struct PriceData {
        uint256 price;          // Precio en 8 decimales (como Chainlink)
        uint256 timestamp;      // Timestamp de última actualización
        uint256 roundId;        // ID de la ronda
        bool isActive;          // Si el feed está activo
        uint256 deviation;      // Desviación máxima permitida (en basis points)
        uint256 heartbeat;      // Tiempo máximo entre actualizaciones (segundos)
    }

    // Estructura para fuentes de precio
    struct PriceFeed {
        AggregatorV3Interface chainlinkFeed;  // Feed de Chainlink
        uint256 fallbackPrice;               // Precio de respaldo
        bool useChainlink;                   // Si usar Chainlink
        bool useFallback;                    // Si usar precio de respaldo
        uint256 weight;                      // Peso en agregación (basis points)
    }

    // Mapeo de símbolos a datos de precio
    mapping(string => PriceData) public priceData;
    mapping(string => PriceFeed) public priceFeeds;
    
    // Arrays para iterar
    string[] public supportedAssets;
    
    // Configuración global
    uint256 public constant PRICE_DECIMALS = 8;
    uint256 public constant MAX_PRICE_DEVIATION = 1000; // 10% máximo
    uint256 public constant MIN_HEARTBEAT = 300; // 5 minutos mínimo
    uint256 public constant MAX_HEARTBEAT = 86400; // 24 horas máximo
    uint256 public constant STALE_PRICE_THRESHOLD = 3600; // 1 hora por defecto

    // Variables de estado
    bool public emergencyMode;
    address public emergencyPriceUpdater;
    uint256 public lastGlobalUpdate;
    
    // Configuración de agregación
    uint256 public priceDeviationThreshold = 500; // 5% por defecto
    uint256 public minimumUpdateInterval = 60; // 1 minuto por defecto

    // Eventos
    event PriceUpdated(
        string indexed asset,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp,
        string source
    );
    
    event PriceFeedAdded(
        string indexed asset,
        address indexed chainlinkFeed,
        uint256 weight
    );
    
    event PriceFeedUpdated(
        string indexed asset,
        bool useChainlink,
        bool useFallback,
        uint256 weight
    );
    
    event EmergencyModeToggled(bool enabled);
    event FallbackPriceSet(string indexed asset, uint256 price);
    event PriceDeviation(string indexed asset, uint256 chainlinkPrice, uint256 finalPrice, uint256 deviation);

    /**
     * @dev Constructor
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_UPDATER_ROLE, msg.sender);
        _grantRole(PRICE_MANAGER_ROLE, msg.sender);
        
        lastGlobalUpdate = block.timestamp;
    }

    /**
     * @dev Agregar un nuevo feed de precio
     * @param asset Símbolo del activo (ej: "AVAX", "USDT", "BTC")
     * @param chainlinkFeed Dirección del feed de Chainlink
     * @param weight Peso en la agregación (basis points, total debe ser 10000)
     * @param heartbeat Tiempo máximo entre actualizaciones
     * @param deviation Desviación máxima permitida
     */
    function addPriceFeed(
        string memory asset,
        address chainlinkFeed,
        uint256 weight,
        uint256 heartbeat,
        uint256 deviation
    ) external onlyRole(PRICE_MANAGER_ROLE) {
        require(bytes(asset).length > 0, "Invalid asset symbol");
        require(weight > 0 && weight <= 10000, "Invalid weight");
        require(heartbeat >= MIN_HEARTBEAT && heartbeat <= MAX_HEARTBEAT, "Invalid heartbeat");
        require(deviation <= MAX_PRICE_DEVIATION, "Invalid deviation");

        // Si no existe, agregar a la lista
        if (!priceData[asset].isActive) {
            supportedAssets.push(asset);
        }

        // Configurar feed
        priceFeeds[asset] = PriceFeed({
            chainlinkFeed: AggregatorV3Interface(chainlinkFeed),
            fallbackPrice: 0,
            useChainlink: chainlinkFeed != address(0),
            useFallback: false,
            weight: weight
        });

        // Configurar datos de precio
        priceData[asset] = PriceData({
            price: 0,
            timestamp: block.timestamp,
            roundId: 0,
            isActive: true,
            deviation: deviation,
            heartbeat: heartbeat
        });

        emit PriceFeedAdded(asset, chainlinkFeed, weight);
    }

    /**
     * @dev Actualizar precio de un activo
     * @param asset Símbolo del activo
     */
    function updatePrice(string memory asset) public onlyRole(ORACLE_UPDATER_ROLE) whenNotPaused {
        require(priceData[asset].isActive, "Asset not supported");

        PriceFeed storage feed = priceFeeds[asset];
        PriceData storage data = priceData[asset];

        uint256 newPrice;
        uint256 roundId;
        string memory source;

        if (feed.useChainlink && address(feed.chainlinkFeed) != address(0)) {
            // Obtener precio de Chainlink
            (newPrice, roundId, source) = _getChainlinkPrice(asset);
            
            // Verificar desviación si hay precio previo
            if (data.price > 0) {
                uint256 deviation = _calculateDeviation(data.price, newPrice);
                if (deviation > data.deviation) {
                    emit PriceDeviation(asset, newPrice, data.price, deviation);
                    
                    // En modo emergencia, usar precio anterior
                    if (emergencyMode) {
                        return;
                    }
                }
            }
        } else if (feed.useFallback) {
            // Usar precio de respaldo
            newPrice = feed.fallbackPrice;
            roundId = data.roundId + 1;
            source = "fallback";
        } else {
            revert("No price source available");
        }

        require(newPrice > 0, "Invalid price");

        // Actualizar datos
        uint256 oldPrice = data.price;
        data.price = newPrice;
        data.timestamp = block.timestamp;
        data.roundId = roundId;

        emit PriceUpdated(asset, oldPrice, newPrice, block.timestamp, source);
    }

    /**
     * @dev Actualizar múltiples precios en lote
     * @param assets Array de símbolos de activos
     */
    function updatePrices(string[] memory assets) external onlyRole(ORACLE_UPDATER_ROLE) {
        require(block.timestamp >= lastGlobalUpdate + minimumUpdateInterval, "Update too frequent");
        
        for (uint256 i = 0; i < assets.length; i++) {
            updatePrice(assets[i]);
        }
        
        lastGlobalUpdate = block.timestamp;
    }

    /**
     * @dev Obtener precio de Chainlink
     */
    function _getChainlinkPrice(string memory asset) internal view returns (uint256, uint256, string memory) {
        PriceFeed storage feed = priceFeeds[asset];
        
        try feed.chainlinkFeed.latestRoundData() returns (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) {
            require(price > 0, "Invalid Chainlink price");
            require(updatedAt > 0, "Invalid update time");
            require(block.timestamp - updatedAt <= priceData[asset].heartbeat, "Price too stale");
            
            return (uint256(price), uint256(roundId), "chainlink");
        } catch {
            revert("Chainlink feed error");
        }
    }

    /**
     * @dev Calcular desviación entre precios
     */
    function _calculateDeviation(uint256 oldPrice, uint256 newPrice) internal pure returns (uint256) {
        if (oldPrice == 0) return 0;
        
        uint256 diff = oldPrice > newPrice ? oldPrice - newPrice : newPrice - oldPrice;
        return (diff * 10000) / oldPrice; // En basis points
    }

    /**
     * @dev Obtener precio actual de un activo
     * @param asset Símbolo del activo
     * @return price Precio en 8 decimales
     * @return timestamp Timestamp de última actualización
     */
    function getPrice(string memory asset) external view returns (uint256 price, uint256 timestamp) {
        require(priceData[asset].isActive, "Asset not supported");
        
        PriceData memory data = priceData[asset];
        require(data.timestamp > 0, "No price data available");
        
        // Verificar si el precio está obsoleto
        if (block.timestamp - data.timestamp > data.heartbeat) {
            revert("Price too stale");
        }
        
        return (data.price, data.timestamp);
    }

    /**
     * @dev Obtener precio sin verificar staleness (para casos de emergencia)
     */
    function getPriceUnsafe(string memory asset) external view returns (uint256 price, uint256 timestamp) {
        require(priceData[asset].isActive, "Asset not supported");
        
        PriceData memory data = priceData[asset];
        return (data.price, data.timestamp);
    }

    /**
     * @dev Obtener múltiples precios en una llamada
     * @param assets Array de símbolos de activos
     * @return prices Array de precios
     * @return timestamps Array de timestamps
     */
    function getPrices(string[] memory assets) external view returns (
        uint256[] memory prices,
        uint256[] memory timestamps
    ) {
        prices = new uint256[](assets.length);
        timestamps = new uint256[](assets.length);
        
        for (uint256 i = 0; i < assets.length; i++) {
            PriceData memory data = priceData[assets[i]];
            require(data.isActive, "Asset not supported");
            
            prices[i] = data.price;
            timestamps[i] = data.timestamp;
        }
    }

    /**
     * @dev Verificar si el precio está actualizado
     * @param asset Símbolo del activo
     * @return True si el precio está fresco
     */
    function isPriceFresh(string memory asset) external view returns (bool) {
        PriceData memory data = priceData[asset];
        if (!data.isActive || data.timestamp == 0) return false;
        
        return (block.timestamp - data.timestamp) <= data.heartbeat;
    }

    /**
     * @dev Establecer precio de respaldo
     * @param asset Símbolo del activo
     * @param price Precio de respaldo
     */
    function setFallbackPrice(
        string memory asset,
        uint256 price
    ) external onlyRole(PRICE_MANAGER_ROLE) {
        require(priceData[asset].isActive, "Asset not supported");
        require(price > 0, "Invalid price");
        
        priceFeeds[asset].fallbackPrice = price;
        priceFeeds[asset].useFallback = true;
        
        emit FallbackPriceSet(asset, price);
    }

    /**
     * @dev Configurar fuente de precio
     * @param asset Símbolo del activo
     * @param useChainlink Si usar Chainlink
     * @param useFallback Si usar precio de respaldo
     * @param weight Nuevo peso
     */
    function configurePriceFeed(
        string memory asset,
        bool useChainlink,
        bool useFallback,
        uint256 weight
    ) external onlyRole(PRICE_MANAGER_ROLE) {
        require(priceData[asset].isActive, "Asset not supported");
        require(useChainlink || useFallback, "Must have at least one source");
        require(weight > 0 && weight <= 10000, "Invalid weight");
        
        PriceFeed storage feed = priceFeeds[asset];
        feed.useChainlink = useChainlink;
        feed.useFallback = useFallback;
        feed.weight = weight;
        
        emit PriceFeedUpdated(asset, useChainlink, useFallback, weight);
    }

    /**
     * @dev Activar/desactivar modo de emergencia
     */
    function toggleEmergencyMode() external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyMode = !emergencyMode;
        emit EmergencyModeToggled(emergencyMode);
    }

    /**
     * @dev Establecer actualizador de emergencia
     */
    function setEmergencyUpdater(address updater) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyPriceUpdater = updater;
    }

    /**
     * @dev Actualización de emergencia (solo en modo emergencia)
     */
    function emergencyUpdatePrice(
        string memory asset,
        uint256 price
    ) external {
        require(emergencyMode, "Not in emergency mode");
        require(msg.sender == emergencyPriceUpdater || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        require(priceData[asset].isActive, "Asset not supported");
        require(price > 0, "Invalid price");
        
        uint256 oldPrice = priceData[asset].price;
        priceData[asset].price = price;
        priceData[asset].timestamp = block.timestamp;
        priceData[asset].roundId++;
        
        emit PriceUpdated(asset, oldPrice, price, block.timestamp, "emergency");
    }

    /**
     * @dev Configurar umbrales globales
     */
    function setGlobalThresholds(
        uint256 _priceDeviationThreshold,
        uint256 _minimumUpdateInterval
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_priceDeviationThreshold <= MAX_PRICE_DEVIATION, "Deviation too high");
        require(_minimumUpdateInterval >= 30, "Interval too short");
        
        priceDeviationThreshold = _priceDeviationThreshold;
        minimumUpdateInterval = _minimumUpdateInterval;
    }

    /**
     * @dev Obtener información completa de un activo
     */
    function getAssetInfo(string memory asset) external view returns (
        uint256 price,
        uint256 timestamp,
        uint256 roundId,
        bool isActive,
        uint256 deviation,
        uint256 heartbeat,
        bool useChainlink,
        bool useFallback,
        uint256 weight
    ) {
        PriceData memory data = priceData[asset];
        PriceFeed memory feed = priceFeeds[asset];
        
        return (
            data.price,
            data.timestamp,
            data.roundId,
            data.isActive,
            data.deviation,
            data.heartbeat,
            feed.useChainlink,
            feed.useFallback,
            feed.weight
        );
    }

    /**
     * @dev Obtener lista de activos soportados
     */
    function getSupportedAssets() external view returns (string[] memory) {
        return supportedAssets;
    }

    /**
     * @dev Remover activo (solo admin)
     */
    function removeAsset(string memory asset) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(priceData[asset].isActive, "Asset not active");
        
        priceData[asset].isActive = false;
        
        // Remover de array (costoso, solo para admin)
        for (uint256 i = 0; i < supportedAssets.length; i++) {
            if (keccak256(bytes(supportedAssets[i])) == keccak256(bytes(asset))) {
                supportedAssets[i] = supportedAssets[supportedAssets.length - 1];
                supportedAssets.pop();
                break;
            }
        }
    }

    /**
     * @dev Pausar contrato
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Despausar contrato
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}

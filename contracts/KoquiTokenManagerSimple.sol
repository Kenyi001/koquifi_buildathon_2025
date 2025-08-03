// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./KoquiCoin.sol";

/**
 * @title KoquiTokenManager
 * @dev Sistema de gestión de supply basado en precio simulado
 * @notice Demuestra cómo funcionaría el sistema de quema y mint automático
 */
contract KoquiTokenManager {
    KoquiCoin public immutable koquiToken;
    
    // Configuración de precios (en formato de 8 decimales como USD)
    uint256 public constant TARGET_PRICE = 1e8; // $1.00
    uint256 public constant PRICE_TOLERANCE = 5e6; // 5% (0.05 * 1e8)
    
    // Configuración de quema/mint
    uint256 public constant BURN_RATE = 100; // 1% por operación (100 basis points)
    uint256 public constant MINT_RATE = 50; // 0.5% por operación (50 basis points)
    uint256 public constant BASIS_POINTS = 10000; // 100%
    
    // Configuración de tiempo
    uint256 public constant INTERVENTION_COOLDOWN = 300; // 5 minutos para demo
    uint256 public lastIntervention;
    
    // Métricas de seguimiento
    uint256 public totalAutoBurned;
    uint256 public totalAutoMinted;
    uint256 public interventionCount;
    
    // Limites de supply
    uint256 public constant MAX_SUPPLY = 500_000_000 * 1e18; // 500M max
    uint256 public constant MIN_SUPPLY = 50_000_000 * 1e18;  // 50M min
    
    // Control de acceso
    address public owner;
    
    // Eventos
    event PriceBasedBurn(uint256 amount, uint256 currentPrice, uint256 newSupply);
    event PriceBasedMint(uint256 amount, uint256 currentPrice, uint256 newSupply);
    event InterventionTriggered(address trigger, uint256 price, string action);
    
    // Estructuras
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        bool isValid;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier cooldownPassed() {
        require(
            block.timestamp >= lastIntervention + INTERVENTION_COOLDOWN,
            "Cooldown period not passed"
        );
        _;
    }
    
    constructor(address _koquiToken) {
        koquiToken = KoquiCoin(_koquiToken);
        owner = msg.sender;
        lastIntervention = block.timestamp;
    }
    
    /**
     * @dev Función principal para verificar si necesita intervención
     */
    function checkAndExecuteIntervention() external cooldownPassed returns (bool) {
        PriceData memory currentPrice = _getLatestPrice();
        
        if (!currentPrice.isValid) {
            return false;
        }
        
        bool executed = false;
        
        if (currentPrice.price > TARGET_PRICE + PRICE_TOLERANCE) {
            // Precio alto -> Quemar tokens
            _executePriceBurn(currentPrice.price);
            emit InterventionTriggered(msg.sender, currentPrice.price, "BURN");
            executed = true;
        } else if (currentPrice.price < TARGET_PRICE - PRICE_TOLERANCE) {
            // Precio bajo -> Mintear tokens
            _executePriceMint(currentPrice.price);
            emit InterventionTriggered(msg.sender, currentPrice.price, "MINT");
            executed = true;
        }
        
        if (executed) {
            lastIntervention = block.timestamp;
            interventionCount++;
        }
        
        return executed;
    }
    
    /**
     * @dev Fuerza una intervención manual (solo owner)
     */
    function forceIntervention(bool burnTokens) external onlyOwner cooldownPassed {
        PriceData memory currentPrice = _getLatestPrice();
        
        if (burnTokens) {
            _executePriceBurn(currentPrice.price);
            emit InterventionTriggered(msg.sender, currentPrice.price, "FORCE_BURN");
        } else {
            _executePriceMint(currentPrice.price);
            emit InterventionTriggered(msg.sender, currentPrice.price, "FORCE_MINT");
        }
        
        lastIntervention = block.timestamp;
        interventionCount++;
    }
    
    /**
     * @dev Ejecuta quema basada en precio
     */
    function _executePriceBurn(uint256 currentPrice) internal {
        uint256 currentSupply = koquiToken.totalSupply();
        
        // Calcular cantidad a quemar basado en desviación del precio
        uint256 priceDeviation = ((currentPrice - TARGET_PRICE) * BASIS_POINTS) / TARGET_PRICE;
        uint256 burnRate = (priceDeviation * BURN_RATE) / BASIS_POINTS;
        
        // Limitar burn rate máximo al 3%
        if (burnRate > BURN_RATE * 3) {
            burnRate = BURN_RATE * 3;
        }
        
        uint256 burnAmount = (currentSupply * burnRate) / BASIS_POINTS;
        
        // Verificar que no bajemos del mínimo
        if (currentSupply - burnAmount < MIN_SUPPLY) {
            burnAmount = currentSupply - MIN_SUPPLY;
        }
        
        if (burnAmount > 0) {
            // Ejecutar quema desde el balance del manager
            uint256 managerBalance = koquiToken.balanceOf(address(this));
            if (managerBalance >= burnAmount) {
                koquiToken.adminBurn(address(this), burnAmount);
                totalAutoBurned += burnAmount;
                
                emit PriceBasedBurn(burnAmount, currentPrice, currentSupply - burnAmount);
            }
        }
    }
    
    /**
     * @dev Ejecuta mint basada en precio
     */
    function _executePriceMint(uint256 currentPrice) internal {
        uint256 currentSupply = koquiToken.totalSupply();
        
        // Calcular cantidad a mintear basado en desviación del precio
        uint256 priceDeviation = ((TARGET_PRICE - currentPrice) * BASIS_POINTS) / TARGET_PRICE;
        uint256 mintRate = (priceDeviation * MINT_RATE) / BASIS_POINTS;
        
        // Limitar mint rate máximo al 1%
        if (mintRate > MINT_RATE * 2) {
            mintRate = MINT_RATE * 2;
        }
        
        uint256 mintAmount = (currentSupply * mintRate) / BASIS_POINTS;
        
        // Verificar que no subamos del máximo
        if (currentSupply + mintAmount > MAX_SUPPLY) {
            mintAmount = MAX_SUPPLY - currentSupply;
        }
        
        if (mintAmount > 0) {
            // Ejecutar mint hacia el manager
            koquiToken.mint(address(this), mintAmount);
            totalAutoMinted += mintAmount;
            
            emit PriceBasedMint(mintAmount, currentPrice, currentSupply + mintAmount);
        }
    }
    
    /**
     * @dev Precio simulado basado en supply (demo purposes)
     */
    function _getLatestPrice() internal view returns (PriceData memory) {
        uint256 currentSupply = koquiToken.totalSupply();
        uint256 initialSupply = 100_000_000 * 1e18; // 100M initial
        
        // Simular precio inversamente proporcional al supply
        // Si supply baja, precio sube (escasez)
        // Si supply sube, precio baja (abundancia)
        uint256 simulatedPrice = (TARGET_PRICE * initialSupply) / currentSupply;
        
        // Añadir algo de volatilidad basada en el tiempo
        uint256 timeVariation = (block.timestamp % 100) * 1e5; // ±1% variación
        simulatedPrice = simulatedPrice + timeVariation - 50e5;
        
        return PriceData({
            price: simulatedPrice,
            timestamp: block.timestamp,
            isValid: true
        });
    }
    
    // Funciones de vista pública
    function getCurrentPrice() external view returns (PriceData memory) {
        return _getLatestPrice();
    }
    
    function getSupplyMetrics() external view returns (
        uint256 currentSupply,
        uint256 burned,
        uint256 minted,
        uint256 interventions
    ) {
        return (
            koquiToken.totalSupply(),
            totalAutoBurned,
            totalAutoMinted,
            interventionCount
        );
    }
    
    function shouldInterveneNow() external view returns (bool, string memory reason, uint256 price) {
        PriceData memory priceData = _getLatestPrice();
        
        if (!priceData.isValid) {
            return (false, "Invalid price data", 0);
        }
        
        if (block.timestamp < lastIntervention + INTERVENTION_COOLDOWN) {
            uint256 remaining = (lastIntervention + INTERVENTION_COOLDOWN) - block.timestamp;
            return (false, string(abi.encodePacked("Cooldown: ", _toString(remaining), "s remaining")), priceData.price);
        }
        
        if (priceData.price > TARGET_PRICE + PRICE_TOLERANCE) {
            return (true, "Price too high - burn needed", priceData.price);
        }
        
        if (priceData.price < TARGET_PRICE - PRICE_TOLERANCE) {
            return (true, "Price too low - mint needed", priceData.price);
        }
        
        return (false, "Price within tolerance", priceData.price);
    }
    
    function getSystemStatus() external view returns (
        uint256 targetPrice,
        uint256 currentPrice,
        uint256 tolerance,
        uint256 currentSupply,
        uint256 minSupply,
        uint256 maxSupply,
        uint256 nextIntervention
    ) {
        PriceData memory price = _getLatestPrice();
        
        return (
            TARGET_PRICE,
            price.price,
            PRICE_TOLERANCE,
            koquiToken.totalSupply(),
            MIN_SUPPLY,
            MAX_SUPPLY,
            lastIntervention + INTERVENTION_COOLDOWN
        );
    }
    
    // Función de utilidad para convertir número a string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // Función de emergencia para retirar tokens
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = koquiToken.balanceOf(address(this));
        if (balance > 0) {
            koquiToken.transfer(owner, balance);
        }
    }
}

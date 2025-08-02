// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Nota: Asegúrate de tener @openzeppelin/contracts instalado
// npm install @openzeppelin/contracts

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KoquiCoin
 * @dev Token ERC20 principal de la plataforma KoquiFI con sistema de quema hiperbólica
 * @notice Este contrato implementa un mecanismo de quema que matemáticamente nunca llegará a cero
 */
contract KoquiCoin is ERC20, AccessControl, Pausable, ReentrancyGuard {
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Constantes del token
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100M tokens
    uint256 public constant MIN_SUPPLY = 1_000_000 * 10**18; // 1M tokens (asintótico)
    uint256 public constant BURN_RATE_PRECISION = 10000; // Precisión para cálculos
    uint256 public constant SAFETY_MARGIN = 110; // 110% del mínimo como margen de seguridad

    // Variables de estado
    uint256 public totalBurned; // Total de tokens quemados
    uint256 public burnCount; // Número de operaciones de quema
    
    // Mapeo de direcciones autorizadas para quemar
    mapping(address => bool) public authorizedBurners;

    // Eventos
    event TokensBurned(address indexed burner, uint256 amount, uint256 newSupply);
    event BurnRateUpdated(uint256 newRate);
    event AuthorizedBurnerAdded(address indexed burner);
    event AuthorizedBurnerRemoved(address indexed burner);

    /**
     * @dev Constructor que inicializa el token y asigna roles
     */
    constructor() ERC20("KoquiCoin", "KOQUI") {
        // Asignar rol de administrador al deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        // Mint del suministro inicial
        _mint(msg.sender, INITIAL_SUPPLY);

        // Autorizar al contrato para quemar sus propios tokens
        authorizedBurners[address(this)] = true;
    }

    /**
     * @dev Función de mint controlada por rol
     * @param to Dirección que recibirá los tokens
     * @param amount Cantidad de tokens a acuñar
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
    }

    /**
     * @dev Función de quema pública con protección hiperbólica
     * @param amount Cantidad de tokens a quemar
     */
    function burn(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        uint256 maxBurnAllowed = getMaxBurnAmount();
        require(amount <= maxBurnAllowed, "Burn amount exceeds safety limit");
        
        _executeBurn(msg.sender, amount);
    }

    /**
     * @dev Función de quema administrativa (sin restricciones hiperbólicas)
     * @param from Dirección desde la que quemar tokens
     * @param amount Cantidad de tokens a quemar
     */
    function adminBurn(address from, uint256 amount) external onlyRole(BURNER_ROLE) whenNotPaused {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        _executeBurn(from, amount);
    }

    /**
     * @dev Función interna para ejecutar la quema
     * @param from Dirección desde la que quemar
     * @param amount Cantidad a quemar
     */
    function _executeBurn(address from, uint256 amount) internal {
        _burn(from, amount);
        
        totalBurned += amount;
        burnCount++;
        
        emit TokensBurned(from, amount, totalSupply());
    }

    /**
     * @dev Calcula la cantidad máxima que se puede quemar basado en función hiperbólica
     * @return Cantidad máxima permitida para quemar
     */
    function getMaxBurnAmount() public view returns (uint256) {
        uint256 currentSupply = totalSupply();
        
        // Protección extrema cerca del mínimo
        uint256 safetyThreshold = (MIN_SUPPLY * SAFETY_MARGIN) / 100;
        if (currentSupply <= safetyThreshold) {
            return 0;
        }
        
        // Implementación de función hiperbólica modificada
        // f(x) = (currentSupply - MIN_SUPPLY) / ln(currentSupply/MIN_SUPPLY)
        uint256 excess = currentSupply - MIN_SUPPLY;
        uint256 ratio = (currentSupply * 1000) / MIN_SUPPLY; // Multiplicar por 1000 para precisión
        
        if (ratio <= 1000) return 0; // Si ratio <= 1, ln sería negativo o cero
        
        uint256 lnRatio = _approximateLn(ratio);
        if (lnRatio == 0) return 0;
        
        // Retornar máximo 10% del exceso sobre el mínimo
        uint256 maxBurn = (excess * 1000) / lnRatio;
        uint256 maxAllowed = (excess * 10) / 100; // Máximo 10% del exceso
        
        return maxBurn > maxAllowed ? maxAllowed : maxBurn;
    }

    /**
     * @dev Aproximación del logaritmo natural para eficiencia de gas
     * @param x Valor multiplicado por 1000 para precisión
     * @return Logaritmo natural aproximado
     */
    function _approximateLn(uint256 x) internal pure returns (uint256) {
        if (x <= 1000) return 0; // ln(1) = 0, evitar negatives
        
        // Aproximación de Taylor: ln(1+z) ≈ z - z²/2 + z³/3 para pequeños z
        // Convertir x a (1+z) form donde x = 1000*(1+z)
        uint256 z = x - 1000; // z en escala de 1000
        
        if (z > 2000) { // Para valores grandes, usar aproximación diferente
            // ln(x) ≈ ln(2) * log2(x) donde ln(2) ≈ 693
            uint256 log2Approx = 0;
            uint256 temp = x;
            while (temp > 1000) {
                temp = temp / 2;
                log2Approx++;
            }
            return (log2Approx * 693) / 1000; // ln(2) ≈ 0.693
        }
        
        // Serie de Taylor para valores pequeños
        uint256 term1 = z;
        uint256 term2 = (z * z) / (2 * 1000);
        uint256 term3 = (z * z * z) / (3 * 1000 * 1000);
        
        return (term1 - term2 + term3) / 100; // Ajuste de escala
    }

    /**
     * @dev Proyección de suministro futuro basado en quema regular
     * @param numWeeks Número de semanas a proyectar
     * @return Array con las proyecciones de suministro
     */
    function getBurnProjection(uint256 numWeeks) external view returns (uint256[] memory) {
        uint256[] memory projection = new uint256[](numWeeks);
        uint256 currentSupply = totalSupply();
        
        for (uint256 i = 0; i < numWeeks; i++) {
            uint256 weeklyMaxBurn = _calculateWeeklyBurn(currentSupply);
            currentSupply = currentSupply > weeklyMaxBurn ? currentSupply - weeklyMaxBurn : currentSupply;
            projection[i] = currentSupply;
        }
        
        return projection;
    }

    /**
     * @dev Calcula la quema semanal promedio basada en el suministro actual
     * @param supply Suministro actual
     * @return Quema semanal estimada
     */
    function _calculateWeeklyBurn(uint256 supply) internal pure returns (uint256) {
        if (supply <= (MIN_SUPPLY * 110) / 100) return 0;
        
        // Aproximar quema semanal como 1/52 del máximo anual permitido
        uint256 excess = supply - MIN_SUPPLY;
        return (excess * 2) / (52 * 100); // ~2% anual, dividido en 52 semanas
    }

    /**
     * @dev Pausar el contrato (solo PAUSER_ROLE)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Despausar el contrato (solo PAUSER_ROLE)
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Agregar dirección autorizada para quemar
     * @param burner Dirección a autorizar
     */
    function addAuthorizedBurner(address burner) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(burner != address(0), "Invalid address");
        authorizedBurners[burner] = true;
        emit AuthorizedBurnerAdded(burner);
    }

    /**
     * @dev Remover dirección autorizada para quemar
     * @param burner Dirección a desautorizar
     */
    function removeAuthorizedBurner(address burner) external onlyRole(DEFAULT_ADMIN_ROLE) {
        authorizedBurners[burner] = false;
        emit AuthorizedBurnerRemoved(burner);
    }

    /**
     * @dev Override para incluir verificación de pausa en transferencias
     */
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }

    /**
     * @dev Ver las estadísticas de quema
     * @return totalBurned_ Total de tokens quemados
     * @return burnCount_ Número de operaciones de quema
     * @return currentSupply_ Suministro actual
     * @return burnRate_ Tasa de quema actual (por 10000)
     */
    function getBurnStats() external view returns (
        uint256 totalBurned_,
        uint256 burnCount_,
        uint256 currentSupply_,
        uint256 burnRate_
    ) {
        totalBurned_ = totalBurned;
        burnCount_ = burnCount;
        currentSupply_ = totalSupply();
        burnRate_ = currentSupply_ > MIN_SUPPLY ? 
            (getMaxBurnAmount() * BURN_RATE_PRECISION) / (currentSupply_ - MIN_SUPPLY) : 0;
    }

    /**
     * @dev Verificar si el contrato soporta una interfaz
     * @param interfaceId ID de la interfaz
     * @return Verdadero si es soportada
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

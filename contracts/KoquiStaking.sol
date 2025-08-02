// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IKoquiCoin is IERC20 {
    function burn(uint256 amount) external;
    function mint(address to, uint256 amount) external;
}

interface IKoquiTicketNFT {
    function mintTicket(address to, uint256[] memory numbers, uint256 weekId, uint256 price) external returns (uint256);
    function finalizeWeek(uint256 weekId, uint256[] memory winners) external;
    function checkMatches(uint256 tokenId) external view returns (uint256);
    function currentWeekId() external view returns (uint256);
    function getUserTickets(address user, uint256 weekId) external view returns (uint256[] memory);
}

/**
 * @title KoquiStaking
 * @dev Contrato principal de staking con sorteos semanales usando Chainlink VRF
 */
contract KoquiStaking is VRFConsumerBaseV2, AutomationCompatibleInterface, AccessControl, ReentrancyGuard, Pausable {
    
    // Roles
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");

    // Chainlink VRF
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private constant CALLBACK_GAS_LIMIT = 500000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 5; // 5 números ganadores

    // Contratos externos
    IKoquiCoin public immutable koquiCoin;
    IKoquiTicketNFT public immutable ticketNFT;

    // Configuración del sorteo
    struct WeeklyDraw {
        uint256 weekId;
        uint256 totalPool;          // Total acumulado en la semana
        uint256 ticketsSold;        // Número de tickets vendidos
        uint256 ticketPrice;        // Precio del ticket en KOQUI
        uint256 startTime;          // Inicio de la semana
        uint256 endTime;            // Fin de la semana
        uint256[] winningNumbers;   // Números ganadores (solo después del sorteo)
        uint256 vrfRequestId;       // ID de la petición VRF
        bool drawn;                 // Si ya se hizo el sorteo
        bool finalized;             // Si ya se finalizó la distribución
        mapping(uint256 => uint256) prizes; // matches => prize amount
    }

    // Variables de estado
    mapping(uint256 => WeeklyDraw) public weeklyDraws;
    mapping(uint256 => uint256) public requestIdToWeekId;
    uint256 public currentWeekId;
    uint256 public constant WEEK_DURATION = 7 days;
    uint256 public ticketPrice = 100 * 10**18; // 100 KOQUI por ticket
    uint256 public constant MAX_NUMBERS = 5;
    uint256 public constant MAX_NUMBER = 50;
    
    // Distribución de premios (en porcentajes de 10000)
    uint256 public constant PRIZE_5_MATCHES = 5000; // 50% para 5 aciertos
    uint256 public constant PRIZE_4_MATCHES = 2500; // 25% para 4 aciertos
    uint256 public constant PRIZE_3_MATCHES = 1500; // 15% para 3 aciertos
    uint256 public constant BURN_PERCENTAGE = 500;  // 5% se quema
    uint256 public constant HOUSE_PERCENTAGE = 500; // 5% para la casa

    // Eventos
    event TicketPurchased(address indexed user, uint256 indexed weekId, uint256 tokenId, uint256[] numbers);
    event DrawRequested(uint256 indexed weekId, uint256 requestId);
    event DrawCompleted(uint256 indexed weekId, uint256[] winningNumbers);
    event PrizeClaimed(address indexed winner, uint256 indexed weekId, uint256 amount, uint256 matches);
    event WeekFinalized(uint256 indexed weekId, uint256 totalDistributed);

    /**
     * @dev Constructor
     */
    constructor(
        uint64 subscriptionId,
        address vrfCoordinator,
        bytes32 gasLane,
        address _koquiCoin,
        address _ticketNFT
    ) VRFConsumerBaseV2(vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        koquiCoin = IKoquiCoin(_koquiCoin);
        ticketNFT = IKoquiTicketNFT(_ticketNFT);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(KEEPER_ROLE, msg.sender);

        currentWeekId = 1;
        _initializeWeek(currentWeekId);
    }

    /**
     * @dev Inicializar una nueva semana
     */
    function _initializeWeek(uint256 weekId) internal {
        WeeklyDraw storage week = weeklyDraws[weekId];
        week.weekId = weekId;
        week.ticketPrice = ticketPrice;
        week.startTime = block.timestamp;
        week.endTime = block.timestamp + WEEK_DURATION;
        
        // Configurar distribución de premios
        week.prizes[5] = PRIZE_5_MATCHES;
        week.prizes[4] = PRIZE_4_MATCHES;
        week.prizes[3] = PRIZE_3_MATCHES;
    }

    /**
     * @dev Comprar un ticket para el sorteo actual
     * @param numbers Array de 5 números únicos entre 1 y 50
     */
    function buyTicket(uint256[] memory numbers) external nonReentrant whenNotPaused {
        require(numbers.length == MAX_NUMBERS, "Must select exactly 5 numbers");
        require(block.timestamp < weeklyDraws[currentWeekId].endTime, "Week has ended");
        
        _validateNumbers(numbers);
        
        // Transferir tokens KOQUI del usuario
        require(koquiCoin.transferFrom(msg.sender, address(this), ticketPrice), "Transfer failed");
        
        // Mint NFT del ticket
        uint256 tokenId = ticketNFT.mintTicket(msg.sender, numbers, currentWeekId, ticketPrice);
        
        // Actualizar estadísticas de la semana
        WeeklyDraw storage week = weeklyDraws[currentWeekId];
        week.totalPool += ticketPrice;
        week.ticketsSold++;
        
        emit TicketPurchased(msg.sender, currentWeekId, tokenId, numbers);
    }

    /**
     * @dev Validar números del ticket
     */
    function _validateNumbers(uint256[] memory numbers) internal pure {
        require(numbers.length == MAX_NUMBERS, "Invalid numbers count");
        
        for (uint256 i = 0; i < numbers.length; i++) {
            require(numbers[i] >= 1 && numbers[i] <= MAX_NUMBER, "Number out of range");
            
            // Verificar que no haya duplicados
            for (uint256 j = i + 1; j < numbers.length; j++) {
                require(numbers[i] != numbers[j], "Duplicate numbers");
            }
        }
        
        // Verificar orden ascendente
        for (uint256 i = 0; i < numbers.length - 1; i++) {
            require(numbers[i] < numbers[i + 1], "Numbers must be in order");
        }
    }

    /**
     * @dev Chainlink Automation - verificar si necesita ejecutar sorteo
     */
    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        WeeklyDraw storage week = weeklyDraws[currentWeekId];
        upkeepNeeded = (
            block.timestamp >= week.endTime &&
            !week.drawn &&
            week.ticketsSold > 0
        );
    }

    /**
     * @dev Chainlink Automation - ejecutar sorteo automáticamente
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        WeeklyDraw storage week = weeklyDraws[currentWeekId];
        require(block.timestamp >= week.endTime, "Week not ended");
        require(!week.drawn, "Already drawn");
        require(week.ticketsSold > 0, "No tickets sold");

        _requestRandomWords(currentWeekId);
    }

    /**
     * @dev Solicitar números aleatorios a Chainlink VRF
     */
    function _requestRandomWords(uint256 weekId) internal {
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        requestIdToWeekId[requestId] = weekId;
        weeklyDraws[weekId].vrfRequestId = requestId;
        
        emit DrawRequested(weekId, requestId);
    }

    /**
     * @dev Callback de Chainlink VRF con números aleatorios
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 weekId = requestIdToWeekId[requestId];
        require(weekId != 0, "Invalid request ID");
        
        WeeklyDraw storage week = weeklyDraws[weekId];
        require(!week.drawn, "Already drawn");

        // Convertir números aleatorios al rango 1-50
        uint256[] memory winningNumbers = new uint256[](MAX_NUMBERS);
        bool[] memory used = new bool[](MAX_NUMBER + 1);
        
        for (uint256 i = 0; i < MAX_NUMBERS; i++) {
            uint256 number;
            do {
                number = (randomWords[i] % MAX_NUMBER) + 1;
                randomWords[i] = uint256(keccak256(abi.encode(randomWords[i])));
            } while (used[number]);
            
            used[number] = true;
            winningNumbers[i] = number;
        }

        // Ordenar números
        _sortNumbers(winningNumbers);
        
        week.winningNumbers = winningNumbers;
        week.drawn = true;

        // Finalizar semana en el contrato NFT
        ticketNFT.finalizeWeek(weekId, winningNumbers);

        emit DrawCompleted(weekId, winningNumbers);

        // Inicializar nueva semana
        currentWeekId++;
        _initializeWeek(currentWeekId);
    }

    /**
     * @dev Ordenar array de números (bubble sort para arrays pequeños)
     */
    function _sortNumbers(uint256[] memory numbers) internal pure {
        for (uint256 i = 0; i < numbers.length - 1; i++) {
            for (uint256 j = 0; j < numbers.length - i - 1; j++) {
                if (numbers[j] > numbers[j + 1]) {
                    uint256 temp = numbers[j];
                    numbers[j] = numbers[j + 1];
                    numbers[j + 1] = temp;
                }
            }
        }
    }

    /**
     * @dev Reclamar premio por tickets ganadores
     * @param weekId ID de la semana
     * @param tokenIds Array de token IDs para reclamar
     */
    function claimPrizes(uint256 weekId, uint256[] memory tokenIds) external nonReentrant whenNotPaused {
        WeeklyDraw storage week = weeklyDraws[weekId];
        require(week.drawn, "Draw not completed");
        require(weekId < currentWeekId, "Cannot claim current week");
        
        uint256 totalPrize = 0;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 matches = ticketNFT.checkMatches(tokenIds[i]);
            if (matches >= 3) { // Solo premios para 3+ aciertos
                uint256 prize = _calculatePrize(weekId, matches);
                if (prize > 0) {
                    totalPrize += prize;
                    emit PrizeClaimed(msg.sender, weekId, prize, matches);
                }
            }
        }

        if (totalPrize > 0) {
            require(koquiCoin.transfer(msg.sender, totalPrize), "Prize transfer failed");
        }
    }

    /**
     * @dev Calcular premio individual basado en aciertos
     */
    function _calculatePrize(uint256 weekId, uint256 matches) internal view returns (uint256) {
        WeeklyDraw storage week = weeklyDraws[weekId];
        if (matches < 3) return 0;
        
        uint256 prizePool = (week.totalPool * week.prizes[matches]) / 10000;
        // Dividir entre número de ganadores con esa cantidad de aciertos
        // Por simplicidad, asumimos distribución equitativa
        return prizePool / 10; // Placeholder - necesita lógica más compleja
    }

    /**
     * @dev Finalizar distribución de una semana (quemar tokens no reclamados)
     */
    function finalizeWeek(uint256 weekId) external onlyRole(OPERATOR_ROLE) {
        WeeklyDraw storage week = weeklyDraws[weekId];
        require(week.drawn, "Week not drawn");
        require(!week.finalized, "Already finalized");
        require(weekId < currentWeekId - 1, "Too recent to finalize");

        // Quemar porcentaje designado
        uint256 burnAmount = (week.totalPool * BURN_PERCENTAGE) / 10000;
        if (burnAmount > 0) {
            koquiCoin.burn(burnAmount);
        }

        // Transferir comisión de la casa
        uint256 houseAmount = (week.totalPool * HOUSE_PERCENTAGE) / 10000;
        if (houseAmount > 0) {
            require(koquiCoin.transfer(msg.sender, houseAmount), "House transfer failed");
        }

        week.finalized = true;
        emit WeekFinalized(weekId, week.totalPool);
    }

    /**
     * @dev Obtener información de una semana
     */
    function getWeekInfo(uint256 weekId) external view returns (
        uint256 totalPool,
        uint256 ticketsSold,
        uint256 ticketPrice_,
        uint256 startTime,
        uint256 endTime,
        uint256[] memory winningNumbers,
        bool drawn,
        bool finalized
    ) {
        WeeklyDraw storage week = weeklyDraws[weekId];
        return (
            week.totalPool,
            week.ticketsSold,
            week.ticketPrice,
            week.startTime,
            week.endTime,
            week.winningNumbers,
            week.drawn,
            week.finalized
        );
    }

    /**
     * @dev Establecer precio del ticket (solo admin)
     */
    function setTicketPrice(uint256 newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newPrice > 0, "Invalid price");
        ticketPrice = newPrice;
    }

    /**
     * @dev Función de emergencia para sorteo manual
     */
    function emergencyDraw(uint256 weekId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!weeklyDraws[weekId].drawn, "Already drawn");
        _requestRandomWords(weekId);
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

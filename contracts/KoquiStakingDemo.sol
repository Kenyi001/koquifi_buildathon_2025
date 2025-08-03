// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

interface IKoquiCoin is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
}

interface IKoquiTicketNFT {
    function mintTicket(address to, uint256[] memory numbers, uint256 weekNumber, uint256 ticketPrice) external returns (uint256);
    function getTicketNumbers(uint256 tokenId) external view returns (uint256[] memory);
    function getTicketWeek(uint256 tokenId) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

/**
 * @title KoquiStakingDemo
 * @dev Versión DEMO para buildathon - Ciclos de 15 segundos en lugar de semanas
 */
contract KoquiStakingDemo is AccessControl, ReentrancyGuard, Pausable, VRFConsumerBaseV2 {
    
    // Roles
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant LOTTERY_MANAGER_ROLE = keccak256("LOTTERY_MANAGER_ROLE");

    // Contratos externos
    IKoquiCoin public immutable koquiCoin;
    IKoquiTicketNFT public immutable ticketNFT;
    VRFCoordinatorV2Interface public immutable vrfCoordinator;

    // Configuración VRF
    uint64 public immutable subscriptionId;
    bytes32 public immutable keyHash;
    uint32 public constant CALLBACK_GAS_LIMIT = 100000;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant NUM_WORDS = 5; // 5 números ganadores

    // ⚡ CONFIGURACIÓN DEMO - 15 SEGUNDOS POR CICLO
    uint256 public constant DEMO_CYCLE_DURATION = 15; // 15 segundos por "semana"
    uint256 public immutable deploymentTime;
    
    // Configuración de premios (porcentajes en basis points, 10000 = 100%)
    uint256 public constant FIRST_PRIZE_PERCENTAGE = 5000;   // 50%
    uint256 public constant SECOND_PRIZE_PERCENTAGE = 3000;  // 30%
    uint256 public constant THIRD_PRIZE_PERCENTAGE = 2000;   // 20%

    // Estado del juego
    struct DemoCycle {
        uint256 cycleNumber;
        uint256 startTime;
        uint256 endTime;
        uint256 totalTickets;
        uint256 prizePool;
        uint8[5] winningNumbers;
        bool drawn;
        bool prizesDistributed;
        uint256 vrfRequestId;
    }

    // Mapeos
    mapping(uint256 => DemoCycle) public demoCycles;
    mapping(uint256 => uint256[]) public cycleTickets; // cycle => ticket IDs
    mapping(uint256 => uint256) public vrfRequests; // requestId => cycle
    mapping(uint256 => mapping(address => uint256[])) public userTicketsInCycle;
    
    uint256 public currentCycle;
    
    // Configuración de premios
    uint256 public ticketPrice = 10 * 10**18; // 10 KOQUI por ticket
    uint256 public stakingRewardPercentage = 100; // 1% por ciclo (demo)

    // Eventos
    event DemoCycleStarted(uint256 indexed cycle, uint256 startTime, uint256 endTime);
    event TicketPurchased(uint256 indexed cycle, address indexed player, uint256 indexed ticketId, uint8[5] numbers);
    event NumbersDrawn(uint256 indexed cycle, uint8[5] winningNumbers, uint256 prizePool);
    event PrizeWon(uint256 indexed cycle, address indexed winner, uint256 prize, uint8 matchCount);
    event VRFRequested(uint256 indexed cycle, uint256 requestId);

    constructor(
        uint64 _subscriptionId,
        address _vrfCoordinator,
        bytes32 _keyHash,
        address _koquiCoin,
        address _ticketNFT
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        require(_koquiCoin != address(0), "Invalid KoquiCoin address");
        require(_ticketNFT != address(0), "Invalid TicketNFT address");
        
        subscriptionId = _subscriptionId;
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        koquiCoin = IKoquiCoin(_koquiCoin);
        ticketNFT = IKoquiTicketNFT(_ticketNFT);
        
        deploymentTime = block.timestamp;
        currentCycle = 1;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(LOTTERY_MANAGER_ROLE, msg.sender);
        
        // Iniciar el primer ciclo demo
        _startNewDemoCycle();
    }

    /**
     * @dev Obtener el ciclo actual basado en el tiempo (15 segundos por ciclo)
     */
    function getCurrentCycle() public view returns (uint256) {
        uint256 timeSinceDeployment = block.timestamp - deploymentTime;
        return (timeSinceDeployment / DEMO_CYCLE_DURATION) + 1;
    }

    /**
     * @dev Verificar si necesitamos cambiar de ciclo
     */
    function checkAndUpdateCycle() public {
        uint256 calculatedCycle = getCurrentCycle();
        if (calculatedCycle > currentCycle) {
            _endCurrentCycle();
            currentCycle = calculatedCycle;
            _startNewDemoCycle();
        }
    }

    /**
     * @dev Comprar ticket para el ciclo actual
     */
    function buyTicket(uint256[5] memory numbers) external nonReentrant whenNotPaused {
        // Verificar que los números están en rango válido
        for (uint i = 0; i < 5; i++) {
            require(numbers[i] >= 1 && numbers[i] <= 50, "Numbers must be between 1 and 50");
        }
        
        // Verificar que no hay duplicados
        for (uint i = 0; i < 5; i++) {
            for (uint j = i + 1; j < 5; j++) {
                require(numbers[i] != numbers[j], "Duplicate numbers not allowed");
            }
        }

        checkAndUpdateCycle();
        
        // Transferir el costo del ticket
        require(koquiCoin.transferFrom(msg.sender, address(this), ticketPrice), "Payment failed");
        
        // Convertir a uint256[] para el NFT
        uint256[] memory numbersArray = new uint256[](5);
        for (uint i = 0; i < 5; i++) {
            numbersArray[i] = numbers[i];
        }
        
        // Mintear el NFT ticket
        uint256 ticketId = ticketNFT.mintTicket(msg.sender, numbersArray, currentCycle, ticketPrice);
        
        // Actualizar el estado del ciclo
        demoCycles[currentCycle].totalTickets++;
        demoCycles[currentCycle].prizePool += ticketPrice;
        cycleTickets[currentCycle].push(ticketId);
        userTicketsInCycle[currentCycle][msg.sender].push(ticketId);
        
        // Convertir de vuelta para el evento
        uint8[5] memory eventNumbers;
        for (uint i = 0; i < 5; i++) {
            eventNumbers[i] = uint8(numbers[i]);
        }
        
        emit TicketPurchased(currentCycle, msg.sender, ticketId, eventNumbers);
    }

    /**
     * @dev Sortear números ganadores (solo para demo - automático)
     */
    function drawNumbers() external onlyRole(LOTTERY_MANAGER_ROLE) {
        checkAndUpdateCycle();
        
        DemoCycle storage cycle = demoCycles[currentCycle];
        require(!cycle.drawn, "Numbers already drawn for this cycle");
        require(cycle.totalTickets > 0, "No tickets sold");
        
        // Para demo rápido, usar números pseudo-aleatorios
        // En producción usaríamos Chainlink VRF
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, currentCycle)));
        
        for (uint i = 0; i < 5; i++) {
            cycle.winningNumbers[i] = uint8((seed >> (i * 8)) % 50) + 1;
        }
        
        cycle.drawn = true;
        
        emit NumbersDrawn(currentCycle, cycle.winningNumbers, cycle.prizePool);
        
        // Distribuir premios automáticamente para demo
        _distributePrizes(currentCycle);
    }

    /**
     * @dev Distribuir premios del ciclo
     */
    function _distributePrizes(uint256 cycleNumber) internal {
        DemoCycle storage cycle = demoCycles[cycleNumber];
        require(cycle.drawn, "Numbers not drawn yet");
        require(!cycle.prizesDistributed, "Prizes already distributed");
        
        uint256[] memory tickets = cycleTickets[cycleNumber];
        
        // Categorizar ganadores por número de aciertos
        address[] memory winners5 = new address[](tickets.length);
        address[] memory winners4 = new address[](tickets.length);
        address[] memory winners3 = new address[](tickets.length);
        
        uint256 count5 = 0;
        uint256 count4 = 0;
        uint256 count3 = 0;
        
        // Verificar cada ticket
        for (uint i = 0; i < tickets.length; i++) {
            uint256 ticketId = tickets[i];
            uint256[] memory ticketNumbers = ticketNFT.getTicketNumbers(ticketId);
            uint8 matches = _countMatches(ticketNumbers, cycle.winningNumbers);
            address owner = ticketNFT.ownerOf(ticketId);
            
            if (matches == 5) {
                winners5[count5++] = owner;
            } else if (matches == 4) {
                winners4[count4++] = owner;
            } else if (matches == 3) {
                winners3[count3++] = owner;
            }
        }
        
        // Distribuir premios
        uint256 totalPrizePool = cycle.prizePool;
        
        if (count5 > 0) {
            uint256 prizePerWinner = (totalPrizePool * FIRST_PRIZE_PERCENTAGE / 10000) / count5;
            for (uint i = 0; i < count5; i++) {
                koquiCoin.transfer(winners5[i], prizePerWinner);
                emit PrizeWon(cycleNumber, winners5[i], prizePerWinner, 5);
            }
        }
        
        if (count4 > 0) {
            uint256 prizePerWinner = (totalPrizePool * SECOND_PRIZE_PERCENTAGE / 10000) / count4;
            for (uint i = 0; i < count4; i++) {
                koquiCoin.transfer(winners4[i], prizePerWinner);
                emit PrizeWon(cycleNumber, winners4[i], prizePerWinner, 4);
            }
        }
        
        if (count3 > 0) {
            uint256 prizePerWinner = (totalPrizePool * THIRD_PRIZE_PERCENTAGE / 10000) / count3;
            for (uint i = 0; i < count3; i++) {
                koquiCoin.transfer(winners3[i], prizePerWinner);
                emit PrizeWon(cycleNumber, winners3[i], prizePerWinner, 3);
            }
        }
        
        cycle.prizesDistributed = true;
    }

    /**
     * @dev Contar número de aciertos
     */
    function _countMatches(uint256[] memory ticketNumbers, uint8[5] memory winningNumbers) internal pure returns (uint8) {
        uint8 matches = 0;
        for (uint i = 0; i < ticketNumbers.length && i < 5; i++) {
            for (uint j = 0; j < 5; j++) {
                if (ticketNumbers[i] == winningNumbers[j]) {
                    matches++;
                    break;
                }
            }
        }
        return matches;
    }

    /**
     * @dev Iniciar nuevo ciclo demo
     */
    function _startNewDemoCycle() internal {
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + DEMO_CYCLE_DURATION;
        
        demoCycles[currentCycle] = DemoCycle({
            cycleNumber: currentCycle,
            startTime: startTime,
            endTime: endTime,
            totalTickets: 0,
            prizePool: 0,
            winningNumbers: [0, 0, 0, 0, 0],
            drawn: false,
            prizesDistributed: false,
            vrfRequestId: 0
        });
        
        emit DemoCycleStarted(currentCycle, startTime, endTime);
    }

    /**
     * @dev Finalizar ciclo actual
     */
    function _endCurrentCycle() internal {
        // Si el ciclo anterior no fue sorteado, hacerlo automáticamente
        if (demoCycles[currentCycle].totalTickets > 0 && !demoCycles[currentCycle].drawn) {
            DemoCycle storage cycle = demoCycles[currentCycle];
            
            // Sorteo automático para demo
            uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, currentCycle)));
            for (uint i = 0; i < 5; i++) {
                cycle.winningNumbers[i] = uint8((seed >> (i * 8)) % 50) + 1;
            }
            cycle.drawn = true;
            
            emit NumbersDrawn(currentCycle, cycle.winningNumbers, cycle.prizePool);
            _distributePrizes(currentCycle);
        }
    }

    // ===== FUNCIONES DE VISTA =====
    
    function getCycleInfo(uint256 cycleNumber) external view returns (DemoCycle memory) {
        return demoCycles[cycleNumber];
    }
    
    function getUserTickets(uint256 cycleNumber, address user) external view returns (uint256[] memory) {
        return userTicketsInCycle[cycleNumber][user];
    }
    
    function getCycleTickets(uint256 cycleNumber) external view returns (uint256[] memory) {
        return cycleTickets[cycleNumber];
    }
    
    function getTimeUntilNextCycle() external view returns (uint256) {
        uint256 currentTime = block.timestamp;
        uint256 cycleEndTime = demoCycles[currentCycle].endTime;
        if (currentTime >= cycleEndTime) {
            return 0;
        }
        return cycleEndTime - currentTime;
    }

    // ===== FUNCIONES VRF (para producción) =====
    
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        // Implementación VRF para producción
        uint256 cycleNumber = vrfRequests[requestId];
        DemoCycle storage cycle = demoCycles[cycleNumber];
        
        for (uint i = 0; i < 5; i++) {
            cycle.winningNumbers[i] = uint8((randomWords[0] >> (i * 8)) % 50) + 1;
        }
        
        cycle.drawn = true;
        emit NumbersDrawn(cycleNumber, cycle.winningNumbers, cycle.prizePool);
    }

    // ===== FUNCIONES DE ADMIN =====
    
    function setTicketPrice(uint256 _newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ticketPrice = _newPrice;
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = koquiCoin.balanceOf(address(this));
        koquiCoin.transfer(msg.sender, balance);
    }
}

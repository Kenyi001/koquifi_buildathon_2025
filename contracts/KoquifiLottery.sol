// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KoquifiLottery
 * @dev Contrato de lotería para la plataforma Koquifi
 */
contract KoquifiLottery is Ownable, ReentrancyGuard {
    struct Ticket {
        address player;
        uint8[6] numbers;
        uint256 drawId;
        bool claimed;
    }
    
    struct Draw {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint8[6] winningNumbers;
        uint256 prizePool;
        bool completed;
        bool drawn;
    }
    
    uint256 public constant TICKET_PRICE = 0.001 ether;
    uint256 public constant DRAW_DURATION = 1 days;
    uint256 public constant MAX_NUMBER = 49;
    
    uint256 public currentDrawId;
    mapping(uint256 => Draw) public draws;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) public playerTickets;
    
    uint256 public ticketCounter;
    uint256 public totalPrizePool;
    
    event TicketPurchased(
        address indexed player,
        uint256 indexed ticketId,
        uint8[6] numbers,
        uint256 indexed drawId
    );
    
    event DrawStarted(uint256 indexed drawId, uint256 endTime);
    event DrawCompleted(uint256 indexed drawId, uint8[6] winningNumbers, uint256 prizePool);
    event PrizeClaimed(address indexed winner, uint256 amount, uint256 ticketId);
    
    constructor() Ownable(msg.sender) {
        _startNewDraw();
    }
    
    /**
     * @dev Comprar un boleto de lotería
     */
    function buyTicket(uint8[6] memory numbers) external payable nonReentrant {
        require(msg.value == TICKET_PRICE, "Incorrect ticket price");
        require(_isCurrentDrawActive(), "No active draw");
        
        // Validar números
        for (uint8 i = 0; i < 6; i++) {
            require(numbers[i] >= 1 && numbers[i] <= MAX_NUMBER, "Invalid number");
            // Verificar que no hay duplicados
            for (uint8 j = i + 1; j < 6; j++) {
                require(numbers[i] != numbers[j], "Duplicate numbers not allowed");
            }
        }
        
        ticketCounter++;
        
        tickets[ticketCounter] = Ticket({
            player: msg.sender,
            numbers: numbers,
            drawId: currentDrawId,
            claimed: false
        });
        
        playerTickets[msg.sender].push(ticketCounter);
        draws[currentDrawId].prizePool += msg.value;
        totalPrizePool += msg.value;
        
        emit TicketPurchased(msg.sender, ticketCounter, numbers, currentDrawId);
        
        // Si el sorteo ha terminado, completarlo automáticamente
        if (block.timestamp >= draws[currentDrawId].endTime) {
            _completeDraw();
        }
    }
    
    /**
     * @dev Obtener información del sorteo actual
     */
    function getCurrentDraw() external view returns (uint256 drawId, uint256 endTime, uint256 prizePool) {
        Draw memory draw = draws[currentDrawId];
        return (draw.id, draw.endTime, draw.prizePool);
    }
    
    /**
     * @dev Obtener boletos de un jugador
     */
    function getPlayerTickets(address player) external view returns (uint256[] memory) {
        return playerTickets[player];
    }
    
    /**
     * @dev Obtener detalles de un boleto
     */
    function getTicketDetails(uint256 ticketId) external view returns (
        address player,
        uint8[6] memory numbers,
        uint256 drawId,
        bool claimed
    ) {
        Ticket memory ticket = tickets[ticketId];
        return (ticket.player, ticket.numbers, ticket.drawId, ticket.claimed);
    }
    
    /**
     * @dev Sortear números ganadores (solo owner)
     */
    function drawWinningNumbers() external onlyOwner {
        require(!draws[currentDrawId].drawn, "Already drawn");
        require(block.timestamp >= draws[currentDrawId].endTime, "Draw not ended yet");
        
        _completeDraw();
    }
    
    /**
     * @dev Reclamar premio
     */
    function claimPrize(uint256 ticketId) external nonReentrant {
        Ticket storage ticket = tickets[ticketId];
        require(ticket.player == msg.sender, "Not ticket owner");
        require(!ticket.claimed, "Prize already claimed");
        
        Draw memory draw = draws[ticket.drawId];
        require(draw.drawn, "Draw not completed");
        
        uint8 matches = _countMatches(ticket.numbers, draw.winningNumbers);
        uint256 prize = _calculatePrize(matches, draw.prizePool);
        
        require(prize > 0, "No prize to claim");
        
        ticket.claimed = true;
        
        (bool success, ) = msg.sender.call{value: prize}("");
        require(success, "Prize transfer failed");
        
        emit PrizeClaimed(msg.sender, prize, ticketId);
    }
    
    /**
     * @dev Retirar fondos (solo owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Iniciar un nuevo sorteo
     */
    function _startNewDraw() internal {
        currentDrawId++;
        draws[currentDrawId] = Draw({
            id: currentDrawId,
            startTime: block.timestamp,
            endTime: block.timestamp + DRAW_DURATION,
            winningNumbers: [0, 0, 0, 0, 0, 0],
            prizePool: 0,
            completed: false,
            drawn: false
        });
        
        emit DrawStarted(currentDrawId, draws[currentDrawId].endTime);
    }
    
    /**
     * @dev Completar el sorteo actual
     */
    function _completeDraw() internal {
        require(!draws[currentDrawId].drawn, "Already drawn");
        
        // Generar números ganadores (pseudo-aleatorios para demo)
        uint8[6] memory winningNumbers;
        for (uint8 i = 0; i < 6; i++) {
            winningNumbers[i] = uint8((uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                currentDrawId,
                i
            ))) % MAX_NUMBER) + 1);
        }
        
        draws[currentDrawId].winningNumbers = winningNumbers;
        draws[currentDrawId].drawn = true;
        draws[currentDrawId].completed = true;
        
        emit DrawCompleted(currentDrawId, winningNumbers, draws[currentDrawId].prizePool);
        
        // Iniciar nuevo sorteo
        _startNewDraw();
    }
    
    /**
     * @dev Verificar si hay un sorteo activo
     */
    function _isCurrentDrawActive() internal view returns (bool) {
        return block.timestamp < draws[currentDrawId].endTime && !draws[currentDrawId].drawn;
    }
    
    /**
     * @dev Contar coincidencias entre números del boleto y números ganadores
     */
    function _countMatches(uint8[6] memory ticketNumbers, uint8[6] memory winningNumbers) 
        internal 
        pure 
        returns (uint8) 
    {
        uint8 matches = 0;
        for (uint8 i = 0; i < 6; i++) {
            for (uint8 j = 0; j < 6; j++) {
                if (ticketNumbers[i] == winningNumbers[j]) {
                    matches++;
                    break;
                }
            }
        }
        return matches;
    }
    
    /**
     * @dev Calcular premio basado en coincidencias
     */
    function _calculatePrize(uint8 matches, uint256 prizePool) internal pure returns (uint256) {
        if (matches == 6) return prizePool * 50 / 100;  // 50% para 6 aciertos
        if (matches == 5) return prizePool * 20 / 100;  // 20% para 5 aciertos
        if (matches == 4) return prizePool * 15 / 100;  // 15% para 4 aciertos
        if (matches == 3) return prizePool * 10 / 100;  // 10% para 3 aciertos
        return 0; // Sin premio para menos de 3 aciertos
    }
    
    /**
     * @dev Obtener información de un sorteo específico
     */
    function getDrawInfo(uint256 drawId) external view returns (
        uint256 id,
        uint256 startTime,
        uint256 endTime,
        uint8[6] memory winningNumbers,
        uint256 prizePool,
        bool completed,
        bool drawn
    ) {
        Draw memory draw = draws[drawId];
        return (
            draw.id,
            draw.startTime,
            draw.endTime,
            draw.winningNumbers,
            draw.prizePool,
            draw.completed,
            draw.drawn
        );
    }
}

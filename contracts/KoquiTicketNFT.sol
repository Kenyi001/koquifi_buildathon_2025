// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title KoquiTicketNFT
 * @dev NFTs que representan tickets de sorteo en KoquiFI
 * @notice Cada ticket es único y contiene números de sorteo + metadata de la semana
 */
contract KoquiTicketNFT is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl, Pausable {
    using Strings for uint256;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Contador de tokens
    uint256 private _tokenIdCounter;

    // Estructura del ticket
    struct TicketData {
        uint256[] numbers;      // Números del ticket (ej: [1, 15, 23, 42, 50])
        uint256 weekId;         // ID de la semana del sorteo
        uint256 purchasePrice;  // Precio pagado en KOQUI tokens
        uint256 timestamp;      // Momento de compra
        address purchaser;      // Quien compró el ticket
        bool claimed;           // Si ya se reclamó algún premio
    }

    // Mapeos
    mapping(uint256 => TicketData) public ticketData;
    mapping(uint256 => uint256[]) public winningNumbers; // weekId => números ganadores
    mapping(uint256 => mapping(address => uint256[])) public userTicketsByWeek; // weekId => user => tokenIds
    mapping(uint256 => bool) public weekFinalized; // weekId => finalized
    
    // Constantes
    uint256 public constant MAX_NUMBERS = 5; // Máximo números por ticket
    uint256 public constant MAX_NUMBER = 50; // Número máximo permitido
    uint256 public constant MIN_NUMBER = 1;  // Número mínimo permitido

    // Variables
    string private _baseTokenURI;
    uint256 public currentWeekId;
    
    // Eventos
    event TicketMinted(
        uint256 indexed tokenId, 
        address indexed purchaser, 
        uint256 indexed weekId, 
        uint256[] numbers,
        uint256 price
    );
    event WeekFinalized(uint256 indexed weekId, uint256[] winningNumbers);
    event PrizeClaimed(uint256 indexed tokenId, address indexed claimer, uint256 prize);

    /**
     * @dev Constructor
     */
    constructor() ERC721("KoquiFI Ticket", "KOQUI-TKT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        currentWeekId = 1;
        _baseTokenURI = "https://api.koquifi.com/tickets/";
    }

    /**
     * @dev Mint un nuevo ticket NFT
     * @param to Dirección que recibirá el NFT
     * @param numbers Array de números del ticket
     * @param weekId ID de la semana del sorteo
     * @param price Precio pagado en tokens KOQUI
     */
    function mintTicket(
        address to,
        uint256[] memory numbers,
        uint256 weekId,
        uint256 price
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(numbers.length == MAX_NUMBERS, "Invalid numbers count");
        require(weekId >= currentWeekId, "Cannot mint for past weeks");
        require(!weekFinalized[weekId], "Week already finalized");
        
        // Validar números
        _validateNumbers(numbers);
        
        // Incrementar contador y mint
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _mint(to, tokenId);
        
        // Guardar datos del ticket
        ticketData[tokenId] = TicketData({
            numbers: numbers,
            weekId: weekId,
            purchasePrice: price,
            timestamp: block.timestamp,
            purchaser: to,
            claimed: false
        });
        
        // Agregar a tickets del usuario para la semana
        userTicketsByWeek[weekId][to].push(tokenId);
        
        emit TicketMinted(tokenId, to, weekId, numbers, price);
        
        return tokenId;
    }

    /**
     * @dev Validar que los números del ticket sean correctos
     * @param numbers Array de números a validar
     */
    function _validateNumbers(uint256[] memory numbers) internal pure {
        require(numbers.length == MAX_NUMBERS, "Must have exactly 5 numbers");
        
        for (uint256 i = 0; i < numbers.length; i++) {
            require(numbers[i] >= MIN_NUMBER && numbers[i] <= MAX_NUMBER, 
                "Number out of range");
            
            // Verificar que no haya duplicados
            for (uint256 j = i + 1; j < numbers.length; j++) {
                require(numbers[i] != numbers[j], "Duplicate numbers not allowed");
            }
        }
        
        // Verificar que estén ordenados (opcional, para consistencia)
        for (uint256 i = 0; i < numbers.length - 1; i++) {
            require(numbers[i] < numbers[i + 1], "Numbers must be in ascending order");
        }
    }

    /**
     * @dev Finalizar semana con números ganadores
     * @param weekId ID de la semana
     * @param winners Array de números ganadores
     */
    function finalizeWeek(
        uint256 weekId, 
        uint256[] memory winners
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(weekId < currentWeekId || 
               (weekId == currentWeekId && block.timestamp > getWeekEndTime(weekId)), 
               "Week not ready for finalization");
        require(!weekFinalized[weekId], "Week already finalized");
        require(winners.length == MAX_NUMBERS, "Invalid winners count");
        
        _validateNumbers(winners);
        
        winningNumbers[weekId] = winners;
        weekFinalized[weekId] = true;
        
        emit WeekFinalized(weekId, winners);
        
        // Avanzar a la siguiente semana si es la actual
        if (weekId == currentWeekId) {
            currentWeekId++;
        }
    }

    /**
     * @dev Calcular el momento de fin de una semana
     * @param weekId ID de la semana
     * @return Timestamp de fin de semana
     */
    function getWeekEndTime(uint256 weekId) public pure returns (uint256) {
        // Cada semana dura 7 días, empezando desde una fecha base
        uint256 baseTime = 1672531200; // 1 enero 2023 00:00:00 UTC (domingo)
        return baseTime + (weekId * 7 days);
    }

    /**
     * @dev Verificar cuántos números coinciden en un ticket
     * @param tokenId ID del token a verificar
     * @return matches Número de coincidencias
     */
    function checkMatches(uint256 tokenId) external view returns (uint256 matches) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        TicketData memory ticket = ticketData[tokenId];
        require(weekFinalized[ticket.weekId], "Week not finalized yet");
        
        uint256[] memory winners = winningNumbers[ticket.weekId];
        matches = 0;
        
        for (uint256 i = 0; i < ticket.numbers.length; i++) {
            for (uint256 j = 0; j < winners.length; j++) {
                if (ticket.numbers[i] == winners[j]) {
                    matches++;
                    break;
                }
            }
        }
    }

    /**
     * @dev Obtener todos los tickets de un usuario para una semana
     * @param user Dirección del usuario
     * @param weekId ID de la semana
     * @return Array de token IDs
     */
    function getUserTickets(address user, uint256 weekId) external view returns (uint256[] memory) {
        return userTicketsByWeek[weekId][user];
    }

    /**
     * @dev Obtener datos completos de un ticket
     * @param tokenId ID del token
     * @return Estructura completa del ticket
     */
    function getTicketData(uint256 tokenId) external view returns (TicketData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return ticketData[tokenId];
    }

    /**
     * @dev Obtener números ganadores de una semana
     * @param weekId ID de la semana
     * @return Array de números ganadores
     */
    function getWinningNumbers(uint256 weekId) external view returns (uint256[] memory) {
        require(weekFinalized[weekId], "Week not finalized");
        return winningNumbers[weekId];
    }

    /**
     * @dev Marcar ticket como reclamado (solo para premios)
     * @param tokenId ID del token
     */
    function markAsClaimed(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        ticketData[tokenId].claimed = true;
        emit PrizeClaimed(tokenId, ownerOf(tokenId), 0); // Prize amount se maneja en otro contrato
    }

    /**
     * @dev Establecer base URI para metadata
     * @param baseURI Nueva base URI
     */
    function setBaseURI(string memory baseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Override para generar token URI
     * @param tokenId ID del token
     * @return URI completa del token
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        string memory baseURI = _baseURI();
        if (bytes(baseURI).length == 0) {
            return _generateDefaultURI(tokenId);
        }
        
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }

    /**
     * @dev Generar URI por defecto si no hay base URI
     * @param tokenId ID del token
     * @return URI generada
     */
    function _generateDefaultURI(uint256 tokenId) internal view returns (string memory) {
        TicketData memory ticket = ticketData[tokenId];
        
        // Generar JSON básico en base64
        string memory numbersStr = _numbersToString(ticket.numbers);
        string memory json = string(abi.encodePacked(
            '{"name": "KoquiFI Ticket #', tokenId.toString(),
            '", "description": "Lottery ticket for week ', ticket.weekId.toString(),
            '", "numbers": [', numbersStr,
            '], "week": ', ticket.weekId.toString(),
            ', "timestamp": ', ticket.timestamp.toString(), '}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", _base64Encode(bytes(json))));
    }

    /**
     * @dev Convertir array de números a string
     * @param numbers Array de números
     * @return String con números separados por comas
     */
    function _numbersToString(uint256[] memory numbers) internal pure returns (string memory) {
        if (numbers.length == 0) return "";
        
        string memory result = numbers[0].toString();
        for (uint256 i = 1; i < numbers.length; i++) {
            result = string(abi.encodePacked(result, ",", numbers[i].toString()));
        }
        return result;
    }

    /**
     * @dev Codificación base64 simple (para URIs)
     * @param data Datos a codificar
     * @return Datos codificados en base64
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen + 32);
        
        assembly {
            mstore(result, encodedLen)
            let tablePtr := add(table, 1)
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))
            let resultPtr := add(result, 32)
            
            for {} lt(dataPtr, endPtr) {}
            {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)
                
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            
            switch mod(mload(data), 3)
            case 1 { mstore8(sub(resultPtr, 2), 0x3d) mstore8(sub(resultPtr, 1), 0x3d) }
            case 2 { mstore8(sub(resultPtr, 1), 0x3d) }
        }
        
        return result;
    }

    /**
     * @dev Pausar contratos
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Despausar contrato
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Override base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override required for OpenZeppelin v5 compatibility
     */
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        override(ERC721, ERC721Enumerable) 
        returns (address) 
    {
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override required for OpenZeppelin v5 compatibility  
     */
    function _increaseBalance(address account, uint128 value) 
        internal 
        override(ERC721, ERC721Enumerable) 
    {
        super._increaseBalance(account, value);
    }

    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

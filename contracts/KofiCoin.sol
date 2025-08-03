// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

/**
 * @title KofiCoin
 * @dev Token ERC20 para la plataforma Koquifi
 */
contract KofiCoin is ERC20, Ownable, ERC20Pausable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 millón de tokens
    uint256 public constant MAX_SUPPLY = 10000000 * 10**18;    // 10 millones de tokens máximo
    
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount);
    
    constructor() ERC20("KofiCoin", "KOFI") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Agregar un nuevo minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remover un minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Mintear nuevos tokens (solo minters autorizados)
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Pausar el contrato (solo owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Despausar el contrato (solo owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Quemar tokens propios
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Override necesario para ERC20Pausable
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}

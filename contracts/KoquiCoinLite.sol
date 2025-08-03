// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KoquiCoinLite
 * @dev Versión ultra-ligera para buildathon con mínimo gas
 */
contract KoquiCoinLite is ERC20, Ownable {
    
    constructor() ERC20("KoquiCoin Lite", "KOQUI") Ownable(msg.sender) {
        _mint(msg.sender, 100_000_000 * 10**18); // 100M tokens
    }
    
    // Solo funciones esenciales para el demo
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

interface IKoquiCoin is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
}

interface ITraderJoeRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
}

interface IChainlinkPriceFeed {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 price,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    function decimals() external view returns (uint8);
}

/**
 * @title KoquiDEX
 * @dev Exchange descentralizado para USDT.e <-> KOQUICOIN usando Trader Joe
 */
contract KoquiDEX is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant LIQUIDITY_MANAGER_ROLE = keccak256("LIQUIDITY_MANAGER_ROLE");

    // Contratos externos
    IKoquiCoin public immutable koquiCoin;
    IERC20 public immutable usdtToken; // USDT.e en Avalanche
    ITraderJoeRouter public immutable traderJoeRouter;
    IChainlinkPriceFeed public immutable usdtPriceFeed;

    // Configuración
    uint256 public constant SLIPPAGE_TOLERANCE = 300; // 3% por defecto
    uint256 public constant MAX_SLIPPAGE = 1000; // 10% máximo
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public swapFee = 30; // 0.3% fee por defecto
    uint256 public constant PRICE_STALENESS_THRESHOLD = 3600; // 1 hora

    // Configuración de liquidez
    uint256 public minLiquidityUSDT = 1000 * 10**6; // Mínimo 1000 USDT.e
    uint256 public minLiquidityKOQUI = 10000 * 10**18; // Mínimo 10000 KOQUI
    
    // Variables de estado
    uint256 public totalVolumeUSDT;
    uint256 public totalVolumeKOQUI;
    uint256 public totalFeesCollected;
    
    mapping(address => uint256) public userVolumeUSDT;
    mapping(address => uint256) public userVolumeKOQUI;

    // Eventos
    event SwapUSDTForKoqui(
        address indexed user,
        uint256 usdtIn,
        uint256 koquiOut,
        uint256 fee,
        uint256 rate
    );
    
    event SwapKoquiForUSDT(
        address indexed user,
        uint256 koquiIn,
        uint256 usdtOut,
        uint256 fee,
        uint256 rate
    );
    
    event LiquidityAdded(
        address indexed provider,
        uint256 usdtAmount,
        uint256 koquiAmount,
        uint256 liquidity
    );
    
    event FeesCollected(address indexed collector, uint256 amount);
    event SwapFeeUpdated(uint256 oldFee, uint256 newFee);

    /**
     * @dev Constructor
     */
    constructor(
        address _koquiCoin,
        address _usdtToken,
        address _traderJoeRouter,
        address _usdtPriceFeed
    ) {
        require(_koquiCoin != address(0), "Invalid KoquiCoin address");
        require(_usdtToken != address(0), "Invalid USDT address");
        require(_traderJoeRouter != address(0), "Invalid router address");
        
        koquiCoin = IKoquiCoin(_koquiCoin);
        usdtToken = IERC20(_usdtToken);
        traderJoeRouter = ITraderJoeRouter(_traderJoeRouter);
        usdtPriceFeed = IChainlinkPriceFeed(_usdtPriceFeed);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(LIQUIDITY_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Intercambiar USDT.e por KOQUICOIN
     * @param usdtAmount Cantidad de USDT.e a intercambiar
     * @param minKoquiOut Cantidad mínima de KOQUI a recibir
     * @param useDirectMint Si usar mint directo o pool de liquidez
     */
    function swapUSDTForKoqui(
        uint256 usdtAmount,
        uint256 minKoquiOut,
        bool useDirectMint
    ) external nonReentrant whenNotPaused {
        require(usdtAmount > 0, "Amount must be greater than 0");
        require(minKoquiOut > 0, "Min output must be greater than 0");

        // Transferir USDT del usuario
        require(usdtToken.transferFrom(msg.sender, address(this), usdtAmount), "Transfer failed");

        uint256 koquiOut;
        uint256 fee = (usdtAmount * swapFee) / FEE_DENOMINATOR;
        uint256 netUSDT = usdtAmount - fee;

        if (useDirectMint) {
            // Mint directo basado en precio oracle
            koquiOut = _calculateDirectMint(netUSDT);
            require(koquiOut >= minKoquiOut, "Insufficient output amount");
            
            // Mint KOQUI tokens
            koquiCoin.mint(msg.sender, koquiOut);
        } else {
            // Usar pool de Trader Joe
            koquiOut = _swapViaTraderJoe(address(usdtToken), address(koquiCoin), netUSDT, minKoquiOut);
        }

        // Actualizar estadísticas
        totalVolumeUSDT += usdtAmount;
        userVolumeUSDT[msg.sender] += usdtAmount;
        totalFeesCollected += fee;

        emit SwapUSDTForKoqui(msg.sender, usdtAmount, koquiOut, fee, (koquiOut * 10**6) / netUSDT);
    }

    /**
     * @dev Intercambiar KOQUICOIN por USDT.e
     * @param koquiAmount Cantidad de KOQUI a intercambiar
     * @param minUSDTOut Cantidad mínima de USDT.e a recibir
     * @param useBurn Si usar burn directo o pool de liquidez
     */
    function swapKoquiForUSDT(
        uint256 koquiAmount,
        uint256 minUSDTOut,
        bool useBurn
    ) external nonReentrant whenNotPaused {
        require(koquiAmount > 0, "Amount must be greater than 0");
        require(minUSDTOut > 0, "Min output must be greater than 0");

        // Transferir KOQUI del usuario
        require(koquiCoin.transferFrom(msg.sender, address(this), koquiAmount), "Transfer failed");

        uint256 usdtOut;
        uint256 fee = (koquiAmount * swapFee) / FEE_DENOMINATOR;
        uint256 netKoqui = koquiAmount - fee;

        if (useBurn) {
            // Burn directo basado en precio oracle
            usdtOut = _calculateDirectBurn(netKoqui);
            require(usdtOut >= minUSDTOut, "Insufficient output amount");
            require(usdtToken.balanceOf(address(this)) >= usdtOut, "Insufficient USDT reserves");
            
            // Burn KOQUI tokens
            koquiCoin.burn(netKoqui);
            
            // Transferir USDT
            usdtToken.safeTransfer(msg.sender, usdtOut);
        } else {
            // Usar pool de Trader Joe
            usdtOut = _swapViaTraderJoe(address(koquiCoin), address(usdtToken), netKoqui, minUSDTOut);
        }

        // Actualizar estadísticas
        totalVolumeKOQUI += koquiAmount;
        userVolumeKOQUI[msg.sender] += koquiAmount;
        totalFeesCollected += fee;

        emit SwapKoquiForUSDT(msg.sender, koquiAmount, usdtOut, fee, (usdtOut * 10**18) / netKoqui);
    }

    /**
     * @dev Calcular mint directo basado en oracle
     */
    function _calculateDirectMint(uint256 usdtAmount) internal view returns (uint256) {
        uint256 usdtPrice = _getUSDTPrice();
        // Por simplicidad, 1 KOQUI = 1 USD
        // En producción, usar un modelo más sofisticado
        return (usdtAmount * usdtPrice * 10**12) / 10**6; // Ajustar decimales
    }

    /**
     * @dev Calcular burn directo basado en oracle
     */
    function _calculateDirectBurn(uint256 koquiAmount) internal view returns (uint256) {
        uint256 usdtPrice = _getUSDTPrice();
        // Por simplicidad, 1 KOQUI = 1 USD
        return (koquiAmount * 10**6) / (usdtPrice * 10**12); // Ajustar decimales
    }

    /**
     * @dev Swap vía Trader Joe
     */
    function _swapViaTraderJoe(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) internal returns (uint256) {
        require(IERC20(tokenIn).approve(address(traderJoeRouter), amountIn), "Approve failed");

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        uint256[] memory amounts = traderJoeRouter.swapExactTokensForTokens(
            amountIn,
            minAmountOut,
            path,
            msg.sender,
            block.timestamp + 300 // 5 minutos deadline
        );

        return amounts[1];
    }

    /**
     * @dev Obtener precio de USDT desde Chainlink
     */
    function _getUSDTPrice() internal view returns (uint256) {
        if (address(usdtPriceFeed) == address(0)) {
            return 10**8; // $1.00 por defecto si no hay oracle
        }

        (, int256 price, , uint256 updatedAt, ) = usdtPriceFeed.latestRoundData();
        require(price > 0, "Invalid price from oracle");
        require(block.timestamp - updatedAt <= PRICE_STALENESS_THRESHOLD, "Stale price");

        return uint256(price);
    }

    /**
     * @dev Obtener tasa de cambio actual
     * @param usdtAmount Cantidad de USDT
     * @return Cantidad de KOQUI que se recibiría
     */
    function getExchangeRate(uint256 usdtAmount) external view returns (uint256) {
        if (usdtAmount == 0) return 0;
        
        uint256 fee = (usdtAmount * swapFee) / FEE_DENOMINATOR;
        uint256 netUSDT = usdtAmount - fee;
        
        return _calculateDirectMint(netUSDT);
    }

    /**
     * @dev Obtener cotización de Trader Joe
     */
    function getTraderJoeQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256) {
        if (amountIn == 0) return 0;

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        try traderJoeRouter.getAmountsOut(amountIn, path) returns (uint256[] memory amounts) {
            return amounts[1];
        } catch {
            return 0;
        }
    }

    /**
     * @dev Agregar liquidez al pool
     * @param usdtAmount Cantidad de USDT.e
     * @param koquiAmount Cantidad de KOQUI
     * @param minUSDT Mínimo USDT aceptable
     * @param minKoqui Mínimo KOQUI aceptable
     */
    function addLiquidity(
        uint256 usdtAmount,
        uint256 koquiAmount,
        uint256 minUSDT,
        uint256 minKoqui
    ) external onlyRole(LIQUIDITY_MANAGER_ROLE) nonReentrant whenNotPaused {
        require(usdtAmount >= minLiquidityUSDT, "USDT amount too low");
        require(koquiAmount >= minLiquidityKOQUI, "KOQUI amount too low");

        // Transferir tokens
        require(usdtToken.transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
        require(koquiCoin.transferFrom(msg.sender, address(this), koquiAmount), "KOQUI transfer failed");

        // Aprobar para Trader Joe
        require(usdtToken.approve(address(traderJoeRouter), usdtAmount), "USDT approve failed");
        require(koquiCoin.approve(address(traderJoeRouter), koquiAmount), "KOQUI approve failed");

        // Agregar liquidez
        (uint256 amountA, uint256 amountB, uint256 liquidity) = traderJoeRouter.addLiquidity(
            address(usdtToken),
            address(koquiCoin),
            usdtAmount,
            koquiAmount,
            minUSDT,
            minKoqui,
            msg.sender,
            block.timestamp + 300
        );

        emit LiquidityAdded(msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @dev Retirar fees acumulados
     */
    function collectFees() external onlyRole(OPERATOR_ROLE) {
        uint256 usdtBalance = usdtToken.balanceOf(address(this));
        if (usdtBalance > 0) {
            usdtToken.safeTransfer(msg.sender, usdtBalance);
            emit FeesCollected(msg.sender, usdtBalance);
        }
    }

    /**
     * @dev Establecer nueva comisión de swap
     */
    function setSwapFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFee <= 500, "Fee too high"); // Máximo 5%
        
        uint256 oldFee = swapFee;
        swapFee = newFee;
        
        emit SwapFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Establecer requisitos mínimos de liquidez
     */
    function setMinLiquidity(
        uint256 _minUSDT,
        uint256 _minKoqui
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minLiquidityUSDT = _minUSDT;
        minLiquidityKOQUI = _minKoqui;
    }

    /**
     * @dev Función de emergencia para retirar tokens
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @dev Obtener estadísticas del DEX
     */
    function getDEXStats() external view returns (
        uint256 totalVolumeUSDT_,
        uint256 totalVolumeKOQUI_,
        uint256 totalFeesCollected_,
        uint256 currentUSDTReserve,
        uint256 currentKOQUIReserve,
        uint256 swapFee_
    ) {
        return (
            totalVolumeUSDT,
            totalVolumeKOQUI,
            totalFeesCollected,
            usdtToken.balanceOf(address(this)),
            koquiCoin.balanceOf(address(this)),
            swapFee
        );
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

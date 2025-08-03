import { ethers } from 'ethers'

// ABI básica para token ERC-20
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
]

// ABI para contrato de lotería
const LOTTERY_ABI = [
  'function buyTicket(uint8[] numbers) external payable',
  'function getCurrentDraw() view returns (uint256 drawId, uint256 endTime, uint256 prizePool)',
  'function getTickets(address player) view returns (uint256[] ticketIds)',
  'function drawWinningNumbers() external',
  'function claimPrize(uint256 ticketId) external',
  'event TicketPurchased(address indexed player, uint256 indexed ticketId, uint8[] numbers)',
  'event DrawCompleted(uint256 indexed drawId, uint8[] winningNumbers, uint256 prizePool)',
  'event PrizeClaimed(address indexed winner, uint256 amount)'
]

// Direcciones de contratos (estas serían las direcciones reales desplegadas)
const CONTRACT_ADDRESSES = {
  // Avalanche Fuji Testnet
  43113: {
    KOFICOIN: '0x742d35Cc6634C0532925a3b8D2C1C0b39B2ba6F7', // Dirección del token KOFICOIN
    LOTTERY: '0x8ba1f109551bD432803012645Hac136c4c30c13E',   // Dirección del contrato de lotería
    SAVINGS: '0x0000000000000000000000000000000000000000'    // Dirección del contrato de ahorros
  },
  // Ethereum Sepolia
  11155111: {
    KOFICOIN: '0x742d35Cc6634C0532925a3b8D2C1C0b39B2ba6F7',
    LOTTERY: '0x8ba1f109551bD432803012645Hac136c4c30c13E',
    SAVINGS: '0x0000000000000000000000000000000000000000'
  }
}

export class ContractService {
  private provider: ethers.BrowserProvider
  private signer: ethers.JsonRpcSigner | null = null
  private chainId: number

  constructor(provider: ethers.BrowserProvider, chainId: number) {
    this.provider = provider
    this.chainId = chainId
  }

  async getSigner() {
    if (!this.signer) {
      this.signer = await this.provider.getSigner()
    }
    return this.signer
  }

  // Servicio para token KOFICOIN
  async getKoficoinContract() {
    const chainContracts = CONTRACT_ADDRESSES[this.chainId as keyof typeof CONTRACT_ADDRESSES]
    if (!chainContracts || !chainContracts.KOFICOIN || chainContracts.KOFICOIN === '0x0000000000000000000000000000000000000000') {
      throw new Error(`Contrato KOFICOIN no desplegado en la red ${this.chainId}`)
    }

    const signer = await this.getSigner()
    return new ethers.Contract(chainContracts.KOFICOIN, ERC20_ABI, signer)
  }

  async getKoficoinBalance(address: string): Promise<string> {
    try {
      const contract = await this.getKoficoinContract()
      const balance = await contract.balanceOf(address)
      const decimals = await contract.decimals()
      return ethers.formatUnits(balance, decimals)
    } catch (error) {
      console.error('Error getting KOFICOIN balance:', error)
      return '0'
    }
  }

  async transferKoficoin(to: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.getKoficoinContract()
    const decimals = await contract.decimals()
    const amountWei = ethers.parseUnits(amount, decimals)
    
    return await contract.transfer(to, amountWei)
  }

  // Servicio para contrato de lotería
  async getLotteryContract() {
    const chainContracts = CONTRACT_ADDRESSES[this.chainId as keyof typeof CONTRACT_ADDRESSES]
    if (!chainContracts || !chainContracts.LOTTERY || chainContracts.LOTTERY === '0x0000000000000000000000000000000000000000') {
      throw new Error(`Contrato de Lotería no desplegado en la red ${this.chainId}`)
    }

    const signer = await this.getSigner()
    return new ethers.Contract(chainContracts.LOTTERY, LOTTERY_ABI, signer)
  }

  async buyLotteryTicket(numbers: number[]): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.getLotteryContract()
    const ticketPrice = ethers.parseEther('0.001') // Precio en ETH/AVAX
    
    return await contract.buyTicket(numbers, { value: ticketPrice })
  }

  async getCurrentLotteryDraw() {
    try {
      const contract = await this.getLotteryContract()
      const [drawId, endTime, prizePool] = await contract.getCurrentDraw()
      
      return {
        drawId: drawId.toString(),
        endTime: new Date(Number(endTime) * 1000),
        prizePool: ethers.formatEther(prizePool)
      }
    } catch (error) {
      console.error('Error getting current draw:', error)
      return null
    }
  }

  async getUserTickets(address: string): Promise<string[]> {
    try {
      const contract = await this.getLotteryContract()
      const tickets = await contract.getTickets(address)
      return tickets.map((ticket: any) => ticket.toString())
    } catch (error) {
      console.error('Error getting user tickets:', error)
      return []
    }
  }

  // Utilidades
  async waitForTransaction(txHash: string): Promise<ethers.TransactionReceipt | null> {
    return await this.provider.waitForTransaction(txHash)
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    return await this.provider.getTransactionReceipt(txHash)
  }

  isContractDeployed(contractType: 'KOFICOIN' | 'LOTTERY' | 'SAVINGS'): boolean {
    const chainContracts = CONTRACT_ADDRESSES[this.chainId as keyof typeof CONTRACT_ADDRESSES]
    return !!(chainContracts && 
              chainContracts[contractType] && 
              chainContracts[contractType] !== '0x0000000000000000000000000000000000000000')
  }

  getContractAddress(contractType: 'KOFICOIN' | 'LOTTERY' | 'SAVINGS'): string | null {
    const chainContracts = CONTRACT_ADDRESSES[this.chainId as keyof typeof CONTRACT_ADDRESSES]
    return chainContracts?.[contractType] || null
  }

  // Función para actualizar direcciones de contratos (para desarrollo)
  static updateContractAddress(chainId: number, contractType: 'KOFICOIN' | 'LOTTERY' | 'SAVINGS', address: string) {
    const chainKey = chainId as keyof typeof CONTRACT_ADDRESSES
    if (CONTRACT_ADDRESSES[chainKey]) {
      CONTRACT_ADDRESSES[chainKey][contractType] = address
      console.log(`✅ Contrato ${contractType} actualizado en red ${chainId}: ${address}`)
    }
  }
}

// Hook para usar el servicio de contratos
export const useContracts = (provider: ethers.BrowserProvider | null, chainId: string) => {
  if (!provider) return null
  
  return new ContractService(provider, parseInt(chainId))
}

// Información de redes
export const NETWORK_INFO = {
  43113: {
    name: 'Avalanche Fuji Testnet',
    currency: 'AVAX',
    explorer: 'https://testnet.snowtrace.io',
    faucet: 'https://faucet.avax.network/',
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc'
  },
  11155111: {
    name: 'Ethereum Sepolia',
    currency: 'ETH',
    explorer: 'https://sepolia.etherscan.io',
    faucet: 'https://sepoliafaucet.com/',
    rpc: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID'
  },
  1: {
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    explorer: 'https://etherscan.io',
    faucet: null,
    rpc: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'
  },
  43114: {
    name: 'Avalanche Mainnet',
    currency: 'AVAX',
    explorer: 'https://snowtrace.io',
    faucet: null,
    rpc: 'https://api.avax.network/ext/bc/C/rpc'
  }
}

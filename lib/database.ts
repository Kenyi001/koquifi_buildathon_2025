// Sistema de base de datos simulada para desarrollo
import { v4 as uuidv4 } from 'uuid'

export interface User {
  id: string
  email: string
  name: string
  profilePicture?: string
  walletAddress: string
  privateKey: string // En producción esto NO se almacenaría así
  kofiBalance: number
  usdtBalance: number
  authMethod: 'google' | 'wallet'
  createdAt: string
  lastLogin: string
  isVerified: boolean
}

export interface LotteryTicket {
  id: string
  userId: string
  lotteryId: string
  numbers: number[]
  purchaseDate: string
  cost: number
  status: 'active' | 'winner' | 'loser'
  winningAmount?: number
}

export interface LotteryDraw {
  id: string
  date: string
  drawDate: string
  winningNumbers: number[]
  prizePool: {
    koficoin: number
    usdt: number
  }
  winners: {
    jackpot: string[] // User IDs
    second: string[]
    third: string[]
  }
  totalParticipants: number
  status: 'upcoming' | 'current' | 'completed'
  tickets: string[] // Ticket IDs
}

export interface Transaction {
  id: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'lottery_purchase' | 'lottery_win' | 'exchange' | 'stake' | 'unstake'
  amount: number
  currency: 'KOQUICOIN' | 'Bs'
  status: 'pending' | 'completed' | 'failed'
  date: string
  description: string
  txHash?: string
}

// Base de datos en memoria (localStorage en el frontend)
class DatabaseService {
  private storagePrefix = 'koquifi_'

  // Usuarios
  getUsers(): User[] {
    const users = localStorage.getItem(this.storagePrefix + 'users')
    return users ? JSON.parse(users) : []
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(this.storagePrefix + 'users', JSON.stringify(users))
  }

  getUserById(id: string): User | null {
    const users = this.getUsers()
    return users.find(user => user.id === id) || null
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers()
    return users.find(user => user.email === email) || null
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): User {
    const users = this.getUsers()
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
    users.push(newUser)
    this.saveUsers(users)
    return newUser
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers()
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex === -1) return null

    users[userIndex] = { ...users[userIndex], ...updates }
    this.saveUsers(users)
    return users[userIndex]
  }

  // Tickets de lotería
  getLotteryTickets(): LotteryTicket[] {
    const tickets = localStorage.getItem(this.storagePrefix + 'tickets')
    return tickets ? JSON.parse(tickets) : []
  }

  saveLotteryTickets(tickets: LotteryTicket[]): void {
    localStorage.setItem(this.storagePrefix + 'tickets', JSON.stringify(tickets))
  }

  getUserTickets(userId: string): LotteryTicket[] {
    const tickets = this.getLotteryTickets()
    return tickets.filter(ticket => ticket.userId === userId)
  }

  createLotteryTicket(ticketData: Omit<LotteryTicket, 'id' | 'purchaseDate'>): LotteryTicket {
    const tickets = this.getLotteryTickets()
    const newTicket: LotteryTicket = {
      ...ticketData,
      id: uuidv4(),
      purchaseDate: new Date().toISOString()
    }
    tickets.push(newTicket)
    this.saveLotteryTickets(tickets)
    return newTicket
  }

  // Sorteos de lotería
  getLotteryDraws(): LotteryDraw[] {
    const draws = localStorage.getItem(this.storagePrefix + 'draws')
    return draws ? JSON.parse(draws) : this.getDefaultDraws()
  }

  saveLotteryDraws(draws: LotteryDraw[]): void {
    localStorage.setItem(this.storagePrefix + 'draws', JSON.stringify(draws))
  }

  getCurrentDraw(): LotteryDraw | null {
    const draws = this.getLotteryDraws()
    return draws.find(draw => draw.status === 'current') || null
  }

  // Transacciones
  getTransactions(): Transaction[] {
    const transactions = localStorage.getItem(this.storagePrefix + 'transactions')
    return transactions ? JSON.parse(transactions) : []
  }

  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(this.storagePrefix + 'transactions', JSON.stringify(transactions))
  }

  getUserTransactions(userId: string): Transaction[] {
    const transactions = this.getTransactions()
    return transactions.filter(tx => tx.userId === userId)
  }

  createTransaction(txData: Omit<Transaction, 'id' | 'date'>): Transaction {
    const transactions = this.getTransactions()
    const newTransaction: Transaction = {
      ...txData,
      id: uuidv4(),
      date: new Date().toISOString()
    }
    transactions.push(newTransaction)
    this.saveTransactions(transactions)
    return newTransaction
  }

  // Datos por defecto
  private getDefaultDraws(): LotteryDraw[] {
    const defaultDraws: LotteryDraw[] = [
      {
        id: 'draw-1',
        date: '2025-07-28',
        drawDate: '2025-07-28T20:00:00Z',
        winningNumbers: [1, 3, 5, 7, 8, 9],
        prizePool: { koficoin: 15000, usdt: 2200 },
        winners: { jackpot: ['user-1'], second: ['user-2', 'user-3'], third: ['user-4'] },
        totalParticipants: 847,
        status: 'completed',
        tickets: []
      },
      {
        id: 'draw-2',
        date: '2025-08-04',
        drawDate: '2025-08-04T20:00:00Z',
        winningNumbers: [2, 4, 6, 7, 8, 9],
        prizePool: { koficoin: 12500, usdt: 1800 },
        winners: { jackpot: ['user-5'], second: ['user-6'], third: [] },
        totalParticipants: 723,
        status: 'completed',
        tickets: []
      },
      {
        id: 'draw-current',
        date: '2025-08-11',
        drawDate: '2025-08-11T20:00:00Z',
        winningNumbers: [],
        prizePool: { koficoin: 22500, usdt: 3200 },
        winners: { jackpot: [], second: [], third: [] },
        totalParticipants: 0,
        status: 'current',
        tickets: []
      }
    ]
    this.saveLotteryDraws(defaultDraws)
    return defaultDraws
  }

  // Método de limpieza para desarrollo
  clearAllData(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.storagePrefix))
    keys.forEach(key => localStorage.removeItem(key))
  }
}

export const db = new DatabaseService()

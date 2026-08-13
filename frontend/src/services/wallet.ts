import api from './api'
import type { Wallet, WalletBalance } from '../types'

export const getMyWallet = () => api.get<Wallet>('/wallets/me')
export const getWalletBalance = (address: string) => api.get<WalletBalance>(`/wallets/${address}/balance`)

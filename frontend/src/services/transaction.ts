import api from './api'
import type { Transaction } from '../types'

export const createTransaction = (data: { receiver_address?: string; receiver_username?: string; amount: number }) =>
  api.post<Transaction>('/transactions', data)

export const getMyTransactions = () => api.get<Transaction[]>('/transactions')
export const getPendingTransactions = () => api.get<Transaction[]>('/transactions/pending')
export const getTransaction = (id: string) => api.get<Transaction>(`/transactions/${id}`)

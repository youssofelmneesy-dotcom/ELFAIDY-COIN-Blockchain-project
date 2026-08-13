import api from './api'
import type { GameStart, GameComplete, GameHistory } from '../types'

export const startGame = () => api.post<GameStart>('/game/start')
export const completeGame = (data: { session_id: string; score: number }) =>
  api.post<GameComplete>('/game/complete', data)
export const getGameHistory = () => api.get<GameHistory[]>('/game/history')

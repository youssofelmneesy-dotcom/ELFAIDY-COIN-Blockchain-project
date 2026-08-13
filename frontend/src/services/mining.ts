import api from './api'
import type { MineResponse } from '../types'

export const mine = () => api.post<MineResponse>('/mining/mine')

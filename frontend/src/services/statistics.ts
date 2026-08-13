import api from './api'
import type { Statistics } from '../types'

export const getStatistics = () => api.get<Statistics>('/statistics')

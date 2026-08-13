import api from './api'
import type { UserSearchResult } from '../types'

export const searchUsers = (q: string) => api.get<UserSearchResult[]>(`/users/search?q=${q}`)

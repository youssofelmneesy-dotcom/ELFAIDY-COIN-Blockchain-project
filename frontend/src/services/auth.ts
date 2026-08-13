import api from './api'
import type { User, Token } from '../types'

export const register = (data: { username: string; email: string; password: string; confirm_password: string }) =>
  api.post<User>('/auth/register', data)

export const login = (data: { username: string; password: string }) =>
  api.post<Token>('/auth/login', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    transformRequest: [(data) => {
      const form = new URLSearchParams()
      for (const key in data) form.append(key, data[key])
      return form.toString()
    }]
  })

export const logout = () => api.post('/auth/logout')
export const getMe = () => api.get<User>('/auth/me')

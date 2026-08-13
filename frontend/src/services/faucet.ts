import api from './api'
import type { FaucetStatus, FaucetClaimResponse } from '../types'

export const getFaucetStatus = () => api.get<FaucetStatus>('/faucet/status')
export const claimFaucet = () => api.post<FaucetClaimResponse>('/faucet/claim')

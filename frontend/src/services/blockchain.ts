import api from './api'
import type {
  BlockchainStatus,
  Block,
  ValidationResult,
  TamperResponse,
} from '../types'

export const getBlockchainStatus = () =>
  api.get<BlockchainStatus>('/blockchain/blockchain')

export const validateBlockchain = () =>
  api.get<ValidationResult>('/blockchain/blockchain/validate')

export const getBlocks = () =>
  api.get<Block[]>('/blockchain/blockchain/blocks')

export const getBlock = (index: number) =>
  api.get<Block>(`/blockchain/blockchain/blocks/${index}`)

export const tamperBlock = (data: {
  block_index: number
  new_amount: number
}) =>
  api.post<TamperResponse>('/blockchain/blockchain/tamper', data)


  
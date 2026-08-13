export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  address: string;
  public_key: string;
  created_at: string;
  balance?: number;
  transaction_count?: number;
}

export interface WalletBalance {
  address: string;
  confirmed_balance: number;
  pending_outgoing: number;
  available_balance: number;
}

export type TransactionType = 'GENESIS' | 'FAUCET_REWARD' | 'MINING_REWARD' | 'GAME_REWARD' | 'TRANSFER';
export type TransactionStatus = 'PENDING' | 'CONFIRMED';

export interface Transaction {
  id: number;
  transaction_id: string;
  sender_address: string | null;
  receiver_address: string;
  amount: number;
  timestamp: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  block_index: number | null;
  signature?: string | null;
  signature_valid?: boolean | null;
}

export interface Block {
  index: number;
  timestamp: string;
  previous_hash: string;
  nonce: number;
  difficulty: number;
  hash: string;
  miner_address: string | null;
  transaction_count: number;
  transactions: Transaction[];
}

export interface BlockchainStatus {
  total_blocks: number;
  total_transactions: number;
  is_valid: boolean;
  genesis_block_hash: string;
  latest_block_hash: string;
}

export interface MineResponse {
  success: boolean;
  block_index: number;
  nonce: number;
  hash: string;
  mining_time_seconds: number;
  reward: number;
  transactions_included: number;
  message: string;
}

export interface FaucetStatus {
  can_claim: boolean;
  last_claimed: string | null;
  next_claim_available: string | null;
  reward_amount: number;
  cooldown_hours: number;
}

export interface GameStart {
  session_id: string;
  started_at: string;
  max_duration_seconds: number;
  message: string;
}

export interface GameComplete {
  success: boolean;
  session_id: string;
  score: number;
  reward: number;
  transaction_id: string | null;
  message: string;
}

export interface GameHistory {
  id: number;
  session_id: string;
  score: number | null;
  reward: number | null;
  rewarded: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface Statistics {
  total_users: number;
  total_wallets: number;
  total_blocks: number;
  total_transactions: number;
  total_transfers: number;
  total_mining_rewards: number;
  total_game_rewards: number;
  total_faucet_rewards: number;
  total_transfer_volume: number;
  efc_circulation: number;
  pending_transactions: number;
  difficulty: number;
  mining_reward: number;
}

export interface UserSearchResult {
  id: number;
  username: string;
  wallet_address: string;
}


export interface Token {
  access_token: string;
  token_type: string;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
  details: string[];
}

export interface TamperResponse {
  success: boolean;
  block_index: number;
  original_hash: string;
  current_hash: string;
  valid_before: boolean;
  valid_after: boolean;
  message?: string;
}

export interface FaucetClaimResponse {
  success: boolean;
  amount: number;
  transaction_id: string | null;
  message: string;
}


import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getMyWallet } from '../services/wallet'
import { getMyTransactions } from '../services/transaction'
import { getBlockchainStatus } from '../services/blockchain'
import { getFaucetStatus, claimFaucet } from '../services/faucet'
import { getStatistics } from '../services/statistics'
import type { Wallet, Transaction, BlockchainStatus, Statistics } from '../types'
import {
  Wallet as WalletIcon, Send, Pickaxe, Gamepad2, Link2,
  Droplets, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [blockchain, setBlockchain] = useState<BlockchainStatus | null>(null)
  const [stats, setStats] = useState<Statistics | null>(null)
  const [faucetClaimed, setFaucetClaimed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [wRes, tRes, bRes, sRes] = await Promise.all([
          getMyWallet(),
          getMyTransactions(),
          getBlockchainStatus(),
          getStatistics()
        ])
        setWallet(wRes.data)
        setTransactions(tRes.data.slice(0, 5))
        setBlockchain(bRes.data)
        setStats(sRes.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [faucetClaimed])

  const handleClaim = async () => {
    try {
      await claimFaucet()
      setFaucetClaimed(p => !p)
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Claim failed')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${blockchain?.is_valid ? 'bg-efc-success' : 'bg-efc-danger'}`} />
          <span className="text-sm text-efc-muted">
            Blockchain {blockchain?.is_valid ? 'Valid' : 'Invalid'}
          </span>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
        <p className="text-efc-muted text-sm mb-1">Your Balance</p>
        <h2 className="text-4xl font-bold text-white">{wallet?.balance?.toLocaleString() || '0'} EFC</h2>
        <p className="text-efc-muted text-sm mt-2 font-mono">{wallet?.address}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/send" className="bg-efc-card border border-slate-700 rounded-xl p-4 hover:border-efc-accent transition-colors">
          <Send className="w-6 h-6 text-efc-accent mb-2" />
          <p className="text-white font-medium">Send EFC</p>
        </Link>
        <Link to="/mining" className="bg-efc-card border border-slate-700 rounded-xl p-4 hover:border-efc-accent transition-colors">
          <Pickaxe className="w-6 h-6 text-efc-warning mb-2" />
          <p className="text-white font-medium">Mine</p>
        </Link>
        <Link to="/game" className="bg-efc-card border border-slate-700 rounded-xl p-4 hover:border-efc-accent transition-colors">
          <Gamepad2 className="w-6 h-6 text-efc-success mb-2" />
          <p className="text-white font-medium">Play Game</p>
        </Link>
        <button onClick={handleClaim} className="bg-efc-card border border-slate-700 rounded-xl p-4 hover:border-efc-accent transition-colors text-left">
          <Droplets className="w-6 h-6 text-cyan-400 mb-2" />
          <p className="text-white font-medium">Claim Faucet</p>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-efc-card border border-slate-700 rounded-xl p-4">
          <p className="text-efc-muted text-xs">Total Blocks</p>
          <p className="text-2xl font-bold text-white">{stats?.total_blocks || 0}</p>
        </div>
        <div className="bg-efc-card border border-slate-700 rounded-xl p-4">
          <p className="text-efc-muted text-xs">Total Transactions</p>
          <p className="text-2xl font-bold text-white">{stats?.total_transactions || 0}</p>
        </div>
        <div className="bg-efc-card border border-slate-700 rounded-xl p-4">
          <p className="text-efc-muted text-xs">Pending</p>
          <p className="text-2xl font-bold text-efc-warning">{stats?.pending_transactions || 0}</p>
        </div>
        <div className="bg-efc-card border border-slate-700 rounded-xl p-4">
          <p className="text-efc-muted text-xs">Circulation</p>
          <p className="text-2xl font-bold text-white">{stats?.efc_circulation?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-efc-card border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <Link to="/transactions" className="text-efc-accent text-sm hover:underline">View All</Link>
        </div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-efc-muted">No transactions yet</div>
        ) : (
          <div className="divide-y divide-slate-700">
            {transactions.map(tx => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  {tx.sender_address === wallet?.address ? (
                    <ArrowUpRight className="w-5 h-5 text-efc-danger" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5 text-efc-success" />
                  )}
                  <div>
                    <p className="text-white font-medium">{tx.transaction_type}</p>
                    <p className="text-xs text-efc-muted font-mono">{tx.transaction_id.slice(0, 20)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.sender_address === wallet?.address ? 'text-efc-danger' : 'text-efc-success'}`}>
                    {tx.sender_address === wallet?.address ? '-' : '+'}{tx.amount} EFC
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {tx.status === 'CONFIRMED' ? (
                      <CheckCircle2 className="w-3 h-3 text-efc-success" />
                    ) : (
                      <Clock className="w-3 h-3 text-efc-warning" />
                    )}
                    <span className="text-xs text-efc-muted">{tx.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

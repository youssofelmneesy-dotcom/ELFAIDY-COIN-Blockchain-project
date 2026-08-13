import { useEffect, useState } from 'react'
import { getPendingTransactions } from '../services/transaction'
import { mine } from '../services/mining'
import { getStatistics } from '../services/statistics'
import type { Transaction, MineResponse, Statistics } from '../types'
import { Pickaxe, Clock, Zap, Hash, Trophy } from 'lucide-react'

export default function MiningPage() {
  const [pending, setPending] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Statistics | null>(null)
  const [mining, setMining] = useState(false)
  const [result, setResult] = useState<MineResponse | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    const [pRes, sRes] = await Promise.all([getPendingTransactions(), getStatistics()])
    setPending(pRes.data)
    setStats(sRes.data)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleMine = async () => {
    setMining(true)
    setError('')
    setResult(null)
    try {
      const res = await mine()
      setResult(res.data)
      await load()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Mining failed')
    } finally {
      setMining(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Mining</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-efc-card border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-efc-muted">Difficulty</p>
          <p className="text-2xl font-bold text-white">{stats?.difficulty || 4}</p>
          <p className="text-xs text-efc-muted">Target: {'0'.repeat(stats?.difficulty || 4)}...</p>
        </div>
        <div className="bg-efc-card border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-efc-muted">Mining Reward</p>
          <p className="text-2xl font-bold text-efc-success">{stats?.mining_reward || 50} EFC</p>
        </div>
        <div className="bg-efc-card border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-efc-muted">Pending Transactions</p>
          <p className="text-2xl font-bold text-efc-warning">{pending.length}</p>
        </div>
      </div>

      <div className="bg-efc-card border border-slate-700 rounded-xl p-6 text-center">
        <Pickaxe className="w-12 h-12 text-efc-accent mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Mine Pending Transactions</h3>
        <p className="text-efc-muted mb-6 max-w-md mx-auto">
          Run Proof of Work to validate pending transactions and add them to the blockchain.
          You will receive the mining reward.
        </p>
        <button
          onClick={handleMine}
          disabled={mining || pending.length === 0}
          className="px-8 py-3 bg-efc-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2 mx-auto"
        >
          <Zap className="w-5 h-5" />
          {mining ? 'Mining...' : pending.length === 0 ? 'No Transactions to Mine' : 'Start Mining'}
        </button>
        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}
      </div>

      {result && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-efc-success" />
            <h3 className="text-xl font-semibold text-white">Block Mined Successfully!</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-efc-muted">Block #</p>
              <p className="text-lg font-bold text-white">{result.block_index}</p>
            </div>
            <div>
              <p className="text-xs text-efc-muted">Nonce</p>
              <p className="text-lg font-bold text-white font-mono">{result.nonce}</p>
            </div>
            <div>
              <p className="text-xs text-efc-muted">Time</p>
              <p className="text-lg font-bold text-white">{result.mining_time_seconds}s</p>
            </div>
            <div>
              <p className="text-xs text-efc-muted">Reward</p>
              <p className="text-lg font-bold text-efc-success">+{result.reward} EFC</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-efc-muted">Hash</p>
            <code className="text-sm font-mono text-efc-accent break-all">{result.hash}</code>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="bg-efc-card border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Pending Transactions ({pending.length})</h3>
          </div>
          <div className="divide-y divide-slate-700">
            {pending.map(tx => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{tx.transaction_type}</p>
                  <code className="text-xs text-efc-muted font-mono">{tx.transaction_id.slice(0, 20)}...</code>
                </div>
                <span className="font-semibold text-white">{tx.amount} EFC</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

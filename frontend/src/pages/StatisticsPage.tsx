import { useEffect, useState } from 'react'
import { getStatistics } from '../services/statistics'
import type { Statistics } from '../types'
import { Users, Wallet, Link2, ScrollText, Pickaxe, Gamepad2, Droplets, ArrowLeftRight, Coins } from 'lucide-react'

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStatistics().then(res => {
      setStats(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>

  const statCards = [
    { label: 'Total Users', value: stats?.total_users, icon: Users, color: 'text-blue-400' },
    { label: 'Total Wallets', value: stats?.total_wallets, icon: Wallet, color: 'text-purple-400' },
    { label: 'Total Blocks', value: stats?.total_blocks, icon: Link2, color: 'text-cyan-400' },
    { label: 'Total Transactions', value: stats?.total_transactions, icon: ScrollText, color: 'text-white' },
    { label: 'Mining Rewards', value: stats?.total_mining_rewards, icon: Pickaxe, color: 'text-efc-warning', suffix: ' EFC' },
    { label: 'Game Rewards', value: stats?.total_game_rewards, icon: Gamepad2, color: 'text-efc-success', suffix: ' EFC' },
    { label: 'Faucet Rewards', value: stats?.total_faucet_rewards, icon: Droplets, color: 'text-cyan-400', suffix: ' EFC' },
    { label: 'Transfer Volume', value: stats?.total_transfer_volume, icon: ArrowLeftRight, color: 'text-pink-400', suffix: ' EFC' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Statistics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-efc-card border border-slate-700 rounded-xl p-4">
              <Icon className={`w-6 h-6 ${card.color} mb-2`} />
              <p className="text-2xl font-bold text-white">{card.value?.toLocaleString() || 0}{card.suffix || ''}</p>
              <p className="text-xs text-efc-muted">{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-efc-card border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Coins className="w-6 h-6 text-efc-accent" />
          <h3 className="text-xl font-semibold text-white">EFC Circulation</h3>
        </div>
        <p className="text-4xl font-bold text-white">{stats?.efc_circulation.toLocaleString() || 0} EFC</p>
        <p className="text-efc-muted mt-2">Total EFC distributed across all reward types and transfers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-efc-card border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Network Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-efc-muted">Pending Transactions</span>
              <span className="text-efc-warning font-semibold">{stats?.pending_transactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-efc-muted">Total Transfers</span>
              <span className="text-white font-semibold">{stats?.total_transfers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-efc-muted">Difficulty</span>
              <span className="text-white font-semibold">{stats?.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-efc-muted">Mining Reward</span>
              <span className="text-efc-success font-semibold">{stats?.mining_reward} EFC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

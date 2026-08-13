import { useEffect, useState } from 'react'
import { getMyTransactions, getPendingTransactions } from '../services/transaction'
import type { Transaction } from '../types'
import { CheckCircle2, Clock, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pending, setPending] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [tRes, pRes] = await Promise.all([
        getMyTransactions(),
        getPendingTransactions()
      ])
      setTransactions(tRes.data)
      setPending(pRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? transactions :
    filter === 'pending' ? transactions.filter(t => t.status === 'PENDING') :
    transactions.filter(t => t.status === 'CONFIRMED')

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Transactions</h1>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-efc-muted" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="bg-efc-card border border-efc-warning/30 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-efc-warning mb-2">Pending Transaction Pool ({pending.length})</h3>
          <p className="text-sm text-efc-muted">These transactions are waiting to be mined into a block.</p>
        </div>
      )}

      <div className="bg-efc-card border border-slate-700 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-efc-muted">No transactions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-efc-muted uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-efc-muted uppercase">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-efc-muted uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-efc-muted uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-efc-muted uppercase">Block</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {tx.sender_address ? (
                          <ArrowUpRight className="w-4 h-4 text-efc-danger" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-efc-success" />
                        )}
                        <span className="text-white text-sm">{tx.transaction_type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-efc-muted">{tx.transaction_id.slice(0, 16)}...</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${tx.sender_address ? 'text-efc-danger' : 'text-efc-success'}`}>
                        {tx.sender_address ? '-' : '+'}{tx.amount} EFC
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {tx.status === 'CONFIRMED' ? (
                          <CheckCircle2 className="w-4 h-4 text-efc-success" />
                        ) : (
                          <Clock className="w-4 h-4 text-efc-warning" />
                        )}
                        <span className={`text-xs ${tx.status === 'CONFIRMED' ? 'text-efc-success' : 'text-efc-warning'}`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-efc-muted">
                        {tx.block_index !== null ? `#${tx.block_index}` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

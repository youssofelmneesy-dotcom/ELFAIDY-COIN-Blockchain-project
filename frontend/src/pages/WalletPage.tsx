import { useEffect, useState } from 'react'
import { getMyWallet, getWalletBalance } from '../services/wallet'
import { getMyTransactions } from '../services/transaction'
import type { Wallet, WalletBalance, Transaction } from '../types'
import { Copy, CheckCircle2, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const wRes = await getMyWallet()
      setWallet(wRes.data)
      const bRes = await getWalletBalance(wRes.data.address)
      setBalance(bRes.data)
      const tRes = await getMyTransactions()
      setTransactions(tRes.data.slice(0, 10))
    }
    load()
  }, [])

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Wallet</h1>

      <div className="bg-efc-card border border-slate-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-efc-muted mb-1">Confirmed Balance</p>
            <p className="text-3xl font-bold text-white">{balance?.confirmed_balance.toLocaleString() || 0} EFC</p>
          </div>
          <div>
            <p className="text-sm text-efc-muted mb-1">Pending Outgoing</p>
            <p className="text-3xl font-bold text-efc-warning">{balance?.pending_outgoing.toLocaleString() || 0} EFC</p>
          </div>
          <div>
            <p className="text-sm text-efc-muted mb-1">Available</p>
            <p className="text-3xl font-bold text-efc-success">{balance?.available_balance.toLocaleString() || 0} EFC</p>
          </div>
        </div>
      </div>

      <div className="bg-efc-card border border-slate-700 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm text-efc-muted">Wallet Address</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 bg-slate-800 px-4 py-2 rounded-lg text-sm font-mono text-efc-accent break-all">
              {wallet?.address}
            </code>
            <button onClick={copyAddress} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600">
              {copied ? <CheckCircle2 className="w-5 h-5 text-efc-success" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm text-efc-muted">Public Key</label>
          <code className="block mt-1 bg-slate-800 px-4 py-2 rounded-lg text-xs font-mono text-efc-muted break-all max-h-32 overflow-auto">
            {wallet?.public_key}
          </code>
        </div>
      </div>

      <div className="bg-efc-card border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Recent Transactions ({transactions.length})</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-efc-muted">No transactions yet</div>
        ) : (
          <div className="divide-y divide-slate-700">
            {transactions.map(tx => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {tx.sender_address === wallet?.address ? (
                    <ArrowUpRight className="w-5 h-5 text-efc-danger" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5 text-efc-success" />
                  )}
                  <div>
                    <p className="text-white text-sm">{tx.transaction_type}</p>
                    <p className="text-xs text-efc-muted font-mono">{tx.transaction_id.slice(0, 16)}...</p>
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

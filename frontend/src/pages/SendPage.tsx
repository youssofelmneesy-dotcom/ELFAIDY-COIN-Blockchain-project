import { useState, useEffect } from 'react'
import { getMyWallet, getWalletBalance } from '../services/wallet'
import { createTransaction } from '../services/transaction'
import { searchUsers } from '../services/user'
import type { WalletBalance, UserSearchResult } from '../types'
import { Send, Search, User } from 'lucide-react'

export default function SendPage() {
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [amount, setAmount] = useState('')
  const [recipientType, setRecipientType] = useState<'username' | 'address'>('username')
  const [username, setUsername] = useState('')
  const [address, setAddress] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const wRes = await getMyWallet()
      const bRes = await getWalletBalance(wRes.data.address)
      setBalance(bRes.data)
    }
    load()
  }, [success])

  const handleSearch = async (q: string) => {
    setUsername(q)
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    try {
      const res = await searchUsers(q)
      setSearchResults(res.data)
    } catch {
      setSearchResults([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const data: any = { amount: parseFloat(amount) }
      if (recipientType === 'username') {
        data.receiver_username = username
      } else {
        data.receiver_address = address
      }
      await createTransaction(data)
      setSuccess(`Successfully sent ${amount} EFC`)
      setAmount('')
      setUsername('')
      setAddress('')
      setSearchResults([])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-white">Send EFC</h1>

      <div className="bg-efc-card border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-efc-muted">Available Balance</p>
            <p className="text-2xl font-bold text-white">{balance?.available_balance.toLocaleString() || 0} EFC</p>
          </div>
          <div>
            <p className="text-sm text-efc-muted">Pending</p>
            <p className="text-lg font-semibold text-efc-warning">{balance?.pending_outgoing.toLocaleString() || 0} EFC</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-efc-muted mb-2">Recipient Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRecipientType('username')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  recipientType === 'username' ? 'bg-efc-accent text-white' : 'bg-slate-700 text-efc-muted'
                }`}
              >
                Username
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('address')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  recipientType === 'address' ? 'bg-efc-accent text-white' : 'bg-slate-700 text-efc-muted'
                }`}
              >
                Wallet Address
              </button>
            </div>
          </div>

          {recipientType === 'username' ? (
            <div className="relative">
              <label className="block text-sm font-medium text-efc-muted mb-1">Recipient Username</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-efc-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-efc-accent outline-none text-white"
                  placeholder="Search username..."
                  required
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden">
                  {searchResults.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => { setUsername(u.username); setSearchResults([]) }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700 text-left"
                    >
                      <User className="w-5 h-5 text-efc-accent" />
                      <div>
                        <p className="text-white font-medium">{u.username}</p>
                        <p className="text-xs text-efc-muted font-mono">{u.wallet_address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-efc-muted mb-1">Wallet Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-efc-accent outline-none text-white font-mono"
                placeholder="EFC_..."
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-efc-muted mb-1">Amount (EFC)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-efc-accent outline-none text-white"
              placeholder="0.00"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-efc-accent hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Processing...' : 'Send EFC'}
          </button>
        </form>
      </div>
    </div>
  )
}

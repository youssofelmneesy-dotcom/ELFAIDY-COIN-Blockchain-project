import { useEffect, useState } from 'react'
import { getBlocks, getBlockchainStatus } from '../services/blockchain'
import type { Block, BlockchainStatus } from '../types'
import { Link2, ChevronDown, ChevronUp, Shield, ShieldAlert } from 'lucide-react'

export default function BlockchainPage() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [status, setStatus] = useState<BlockchainStatus | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      const [bRes, sRes] = await Promise.all([getBlocks(), getBlockchainStatus()])
      setBlocks(bRes.data)
      setStatus(sRes.data)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Blockchain Explorer</h1>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${status?.is_valid ? 'bg-green-500/10 text-efc-success' : 'bg-red-500/10 text-efc-danger'}`}>
          {status?.is_valid ? <Shield className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          <span className="font-medium">{status?.is_valid ? 'Valid' : 'Invalid'}</span>
        </div>
      </div>

      <div className="space-y-4">
        {blocks.map((block, i) => (
          <div key={block.index} className={`bg-efc-card border rounded-xl overflow-hidden ${
            block.index === 0 ? 'border-purple-500/30' : 'border-slate-700'
          }`}>
            <button
              onClick={() => setExpanded(expanded === block.index ? null : block.index)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                  block.index === 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-efc-accent/20 text-efc-accent'
                }`}>
                  {block.index === 0 ? 'G' : block.index}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">
                    {block.index === 0 ? 'Genesis Block' : `Block #${block.index}`}
                  </p>
                  <p className="text-xs text-efc-muted font-mono">{block.hash.slice(0, 24)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-efc-muted">{block.transaction_count} txs</span>
                {expanded === block.index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>

            {expanded === block.index && (
              <div className="p-4 border-t border-slate-700 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-efc-muted">Hash</p>
                    <code className="text-sm font-mono text-efc-accent break-all">{block.hash}</code>
                  </div>
                  <div>
                    <p className="text-xs text-efc-muted">Previous Hash</p>
                    <code className="text-sm font-mono text-efc-muted break-all">{block.previous_hash}</code>
                  </div>
                  <div>
                    <p className="text-xs text-efc-muted">Nonce</p>
                    <p className="text-sm font-mono text-white">{block.nonce}</p>
                  </div>
                  <div>
                    <p className="text-xs text-efc-muted">Difficulty</p>
                    <p className="text-sm font-mono text-white">{block.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-efc-muted">Miner</p>
                    <p className="text-sm font-mono text-white">{block.miner_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-efc-muted">Timestamp</p>
                    <p className="text-sm text-white">{new Date(block.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                {block.transactions.length > 0 && (
                  <div>
                    <p className="text-xs text-efc-muted mb-2">Transactions</p>
                    <div className="space-y-2">
                      {block.transactions.map(tx => (
                        <div key={tx.id} className="bg-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white">{tx.transaction_type}</span>
                            <span className="text-sm font-semibold text-white">{tx.amount} EFC</span>
                          </div>
                          <code className="text-xs text-efc-muted font-mono">{tx.transaction_id}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

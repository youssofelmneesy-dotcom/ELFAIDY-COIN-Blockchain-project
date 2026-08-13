import { useEffect, useState } from 'react'
import {
  validateBlockchain,
  tamperBlock,
  getBlocks,
} from '../services/blockchain'
import type {
  Block,
  ValidationResult,
  TamperResponse,
} from '../types'
import {
  Shield,
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'

export default function SecurityPage() {
  const [validation, setValidation] =
    useState<ValidationResult | null>(null)

  const [blocks, setBlocks] = useState<Block[]>([])

  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)

  const [newAmount, setNewAmount] = useState('1000')

  const [tamperResult, setTamperResult] =
    useState<TamperResponse | null>(null)

  const [loading, setLoading] = useState(false)
  const [tampering, setTampering] = useState(false)

  const load = async () => {
    try {
      const [vRes, bRes] = await Promise.all([
        validateBlockchain(),
        getBlocks(),
      ])

      setValidation(vRes.data)
      setBlocks(bRes.data)

      // Only blocks after Genesis can be tampered with.
      const tamperableBlocks = bRes.data.filter(
        (block) => block.index > 0
      )

      if (tamperableBlocks.length > 0) {
        setSelectedBlock((current) => {
          const stillExists = tamperableBlocks.some(
            (block) => block.index === current
          )

          return stillExists
            ? current
            : tamperableBlocks[0].index
        })
      } else {
        setSelectedBlock(null)
      }
    } catch (error) {
      console.error('Failed to load blockchain security data:', error)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleValidate = async () => {
    setLoading(true)

    try {
      await load()
    } finally {
      setLoading(false)
    }
  }

  const handleTamper = async () => {
    if (selectedBlock === null) {
      alert('No block is available for tampering.')
      return
    }

    const amount = parseFloat(newAmount)

    if (Number.isNaN(amount)) {
      alert('Please enter a valid amount.')
      return
    }

    setTampering(true)

    try {
      const res = await tamperBlock({
        block_index: selectedBlock,
        new_amount: amount,
      })

      setTamperResult(res.data)

      // Reload validation state after tampering.
      await load()
    } catch (error: any) {
      alert(
        error.response?.data?.detail ||
          'Tampering failed'
      )
    } finally {
      setTampering(false)
    }
  }

  const tamperableBlocks = blocks.filter(
    (block) => block.index > 0
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Security Demo
        </h1>

        <p className="text-efc-muted mt-1">
          Validate blockchain integrity and simulate tampering.
        </p>
      </div>

      {/* Blockchain Validation */}
      <div
        className={`p-6 rounded-xl border ${
          validation?.valid
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          {validation?.valid ? (
            <Shield className="w-8 h-8 text-efc-success" />
          ) : (
            <ShieldAlert className="w-8 h-8 text-efc-danger" />
          )}

          <div>
            <h2 className="text-xl font-semibold text-white">
              Blockchain is{' '}
              {validation?.valid ? 'VALID' : 'INVALID'}
            </h2>

            <p className="text-efc-muted">
              {validation?.message}
            </p>
          </div>
        </div>

        <button
          onClick={handleValidate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              loading ? 'animate-spin' : ''
            }`}
          />

          Validate Blockchain
        </button>

        {validation?.details &&
          validation.details.length > 0 && (
            <div className="mt-4 space-y-1">
              {validation.details.map((detail, index) => (
                <p
                  key={index}
                  className={`text-sm ${
                    validation.valid
                      ? 'text-efc-success'
                      : 'text-efc-danger'
                  }`}
                >
                  {detail}
                </p>
              ))}
            </div>
          )}
      </div>

      {/* Tampering Demo */}
      <div className="bg-efc-card border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-efc-warning" />

          <h3 className="text-xl font-semibold text-white">
            Simulate Tampering
          </h3>
        </div>

        <p className="text-efc-muted mb-4">
          Modify a transaction amount inside a block and
          observe how the blockchain detects the change
          through hash validation.
        </p>

        {tamperableBlocks.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
            <p className="text-efc-muted">
              No mineable blocks are available yet.
            </p>

            <p className="text-sm text-slate-500 mt-1">
              The Genesis Block is protected and cannot be
              tampered with from this demo.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <select
                value={selectedBlock ?? ''}
                onChange={(event) =>
                  setSelectedBlock(
                    Number(event.target.value)
                  )
                }
                className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
              >
                {tamperableBlocks.map((block) => (
                  <option
                    key={block.index}
                    value={block.index}
                  >
                    Block #{block.index}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={newAmount}
                onChange={(event) =>
                  setNewAmount(event.target.value)
                }
                className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
                placeholder="New amount"
              />

              <button
                onClick={handleTamper}
                disabled={
                  tampering || selectedBlock === null
                }
                className="px-6 py-2 bg-efc-danger hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tampering
                  ? 'Tampering...'
                  : 'Tamper Block'}
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Genesis Block (#0) is excluded because it is
              immutable by design.
            </p>
          </>
        )}

        {/* Tampering Result */}
        {tamperResult && (
          <div className="mt-4 p-4 bg-slate-800 rounded-lg space-y-3">
            <p className="text-white font-medium">
              Tampering Result
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-efc-muted mb-1">
                  Original Hash
                </p>

                <code className="text-efc-success font-mono break-all">
                  {tamperResult.original_hash}
                </code>
              </div>

              <div>
                <p className="text-efc-muted mb-1">
                  Current Hash
                </p>

                <code className="text-efc-danger font-mono break-all">
                  {tamperResult.current_hash}
                </code>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tamperResult.valid_before
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                Before:{' '}
                {tamperResult.valid_before
                  ? 'Valid'
                  : 'Invalid'}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tamperResult.valid_after
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                After:{' '}
                {tamperResult.valid_after
                  ? 'Valid'
                  : 'Invalid'}
              </span>
            </div>

            <p className="text-sm text-efc-muted">
              {tamperResult.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


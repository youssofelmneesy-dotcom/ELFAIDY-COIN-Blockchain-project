import { useAuth } from '../contexts/AuthContext'
import { Shield, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <div className="bg-efc-card border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-efc-muted">Username</label>
            <p className="text-white font-mono">{user?.username}</p>
          </div>
          <div>
            <label className="text-sm text-efc-muted">Email</label>
            <p className="text-white font-mono">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-efc-card border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-efc-warning" />
          <h2 className="text-xl font-semibold text-white">Security Notice</h2>
        </div>
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-efc-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-efc-warning font-medium">Educational Platform Only</p>
            <p className="text-efc-muted text-sm mt-1">
              Elfaidy Coin is an educational cryptocurrency simulation. EFC has no real monetary value.
              Do not use real passwords or personal information. Private keys are stored server-side for demo purposes only — this is NOT production-grade security.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

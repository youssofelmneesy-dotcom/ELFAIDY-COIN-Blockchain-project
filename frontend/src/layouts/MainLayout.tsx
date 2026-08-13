import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Home, Wallet, Send, ScrollText, Pickaxe, Gamepad2,
  Link2, BarChart3, ShieldCheck, BookOpen, Settings, LogOut,
  Coins, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/send', label: 'Send EFC', icon: Send },
  { path: '/transactions', label: 'Transactions', icon: ScrollText },
  { path: '/mining', label: 'Mining', icon: Pickaxe },
  { path: '/game', label: 'EFC Game', icon: Gamepad2 },
  { path: '/blockchain', label: 'Blockchain', icon: Link2 },
  { path: '/statistics', label: 'Statistics', icon: BarChart3 },
  { path: '/security', label: 'Security Demo', icon: ShieldCheck },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="flex h-screen bg-efc-dark">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-efc-card border-r border-slate-700
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <Coins className="w-8 h-8 text-efc-accent" />
          <div>
            <h1 className="text-xl font-bold text-white">ELFAIDY COIN</h1>
            <p className="text-xs text-efc-muted">Educational Crypto</p>
          </div>
          <button className="lg:hidden ml-auto" onClick={() => setMobileOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-efc-accent/20 text-efc-accent border border-efc-accent/30'
                    : 'text-efc-muted hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-efc-accent/20 flex items-center justify-center text-efc-accent font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-efc-muted truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 w-full text-efc-danger hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="lg:hidden p-4 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold">Elfaidy Coin</span>
        </div>
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

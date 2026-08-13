import { BookOpen, Link2, Hash, Key, Shield, Pickaxe, AlertTriangle, Gamepad2 } from 'lucide-react'

const sections = [
  {
    icon: Link2,
    title: 'What is a Blockchain?',
    content: 'A blockchain is a distributed ledger that records transactions across many computers. Each block contains a list of transactions and is linked to the previous block through cryptographic hashes, forming an immutable chain.'
  },
  {
    icon: Hash,
    title: 'Hashing',
    content: 'SHA-256 hashing converts any data into a fixed 64-character string. Even a tiny change in input produces a completely different hash. This makes tampering immediately detectable because the hash will no longer match.'
  },
  {
    icon: Key,
    title: 'Wallets & Keys',
    content: 'Each wallet has a private key (kept secret) and a public key (shared). The public key generates your wallet address. In Elfaidy Coin, keys use ECDSA (Elliptic Curve Digital Signature Algorithm) for strong security.'
  },
  {
    icon: Shield,
    title: 'Digital Signatures',
    content: 'When you send EFC, your private key signs the transaction. Anyone can verify this signature with your public key. This proves you authorized the transaction and ensures the data was not tampered with in transit.'
  },
  {
    icon: Pickaxe,
    title: 'Mining & Proof of Work',
    content: 'Miners compete to find a nonce (a number) that makes the block hash start with a certain number of zeros (difficulty). This requires computational work, making it expensive to attack the network. The first miner to solve it adds the block and earns a reward.'
  },
  {
    icon: AlertTriangle,
    title: 'Double Spending',
    content: 'Double spending is when someone tries to spend the same coins twice. Elfaidy Coin prevents this by tracking pending outgoing transactions. Your available balance = confirmed balance - pending outgoing. You cannot create a transaction that exceeds your available balance.'
  },
  {
    icon: BookOpen,
    title: 'Tampering Detection',
    content: "If someone changes a block's data, its hash changes. But the next block still stores the OLD hash, creating a mismatch. The entire chain becomes invalid. This is why blockchain data is considered immutable."
  },
  {
    icon: Gamepad2,
    title: 'Game Rewards',
    content: 'The EFC mini-game demonstrates controlled reward distribution. The backend validates game sessions: it checks duration, score bounds, and prevents replay attacks. Rewards are calculated server-side — never trust the frontend score!'
  }
]

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Learn Blockchain</h1>
      <p className="text-efc-muted">Understand how Elfaidy Coin works under the hood.</p>

      <div className="grid grid-cols-1 gap-4">
        {sections.map((section, i) => {
          const Icon = section.icon
          return (
            <div key={i} className="bg-efc-card border border-slate-700 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-efc-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-efc-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{section.title}</h3>
                  <p className="text-efc-muted leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

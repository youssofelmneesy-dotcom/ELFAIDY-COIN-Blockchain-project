
import { useEffect, useRef, useState, useCallback } from 'react'
import { startGame, completeGame, getGameHistory } from '../services/game'
import { getMyWallet } from '../services/wallet'
import type { GameStart, GameComplete, GameHistory, Wallet } from '../types'
import { Gamepad2, Play, RotateCcw, Trophy, Clock, MousePointer2 } from 'lucide-react'

interface GameObject {
  x: number
  y: number
  type: 'coin' | 'penalty'
  size: number
}

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 400
const PLAYER_WIDTH = 50
const PLAYER_HEIGHT = 30
const PLAYER_Y = CANVAS_HEIGHT - 40
const PLAYER_MIN_X = PLAYER_WIDTH / 2
const PLAYER_MAX_X = CANVAS_WIDTH - PLAYER_WIDTH / 2

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [session, setSession] = useState<GameStart | null>(null)
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45)
  const [result, setResult] = useState<GameComplete | null>(null)
  const [history, setHistory] = useState<GameHistory[]>([])
  const [playerX, setPlayerX] = useState(CANVAS_WIDTH / 2)

  const playerXRef = useRef(CANVAS_WIDTH / 2)
  const objectsRef = useRef<GameObject[]>([])
  const animRef = useRef<number>(0)
  const lastSpawnRef = useRef(0)

  useEffect(() => {
    getMyWallet().then(r => setWallet(r.data))
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const res = await getGameHistory()
      setHistory(res.data)
    } catch (error) {
      console.error('Failed to load game history:', error)
    }
  }

  const updatePlayerX = useCallback((x: number) => {
    const clampedX = Math.max(
      PLAYER_MIN_X,
      Math.min(PLAYER_MAX_X, x)
    )

    playerXRef.current = clampedX
    setPlayerX(clampedX)
  }, [])

  const handleStart = async () => {
    try {
      const res = await startGame()

      setSession(res.data)
      setGameState('playing')
      setScore(0)
      setTimeLeft(res.data.max_duration_seconds || 45)
      setResult(null)

      playerXRef.current = CANVAS_WIDTH / 2
      setPlayerX(CANVAS_WIDTH / 2)

      objectsRef.current = []
      lastSpawnRef.current = 0
    } catch (error: any) {
      alert(
        error.response?.data?.detail ||
        'Failed to start game'
      )
    }
  }

  const handleComplete = async (finalScore: number) => {
    if (!session) return

    try {
      const res = await completeGame({
        session_id: session.session_id,
        score: finalScore
      })

      setResult(res.data)
      await loadHistory()

      const walletRes = await getMyWallet()
      setWallet(walletRes.data)
    } catch (error: any) {
      alert(
        error.response?.data?.detail ||
        'Game completion failed'
      )
    }
  }

  /*
   * GAME LOOP
   */
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
      }

      return
    }

    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const gameDuration =
      session?.max_duration_seconds || 45

    const startTime = Date.now()

    let currentScore = 0
    let currentTime = gameDuration

    const gameLoop = () => {
      const now = Date.now()

      const elapsed =
        (now - startTime) / 1000

      currentTime = Math.max(
        0,
        gameDuration - elapsed
      )

      setTimeLeft(Math.ceil(currentTime))

      /*
       * GAME END
       */
      if (currentTime <= 0) {
        setGameState('ended')
        handleComplete(currentScore)
        return
      }

      /*
       * CLEAR CANVAS
       */
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      )

      /*
       * GRID
       */
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 1

      for (
        let i = 0;
        i < canvas.width;
        i += 40
      ) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }

      for (
        let i = 0;
        i < canvas.height;
        i += 40
      ) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      /*
       * SPAWN OBJECTS
       */
      if (now - lastSpawnRef.current > 600) {
        lastSpawnRef.current = now

        const isCoin = Math.random() > 0.3

        objectsRef.current.push({
          x:
            Math.random() *
              (canvas.width - 30) +
            15,

          y: -30,

          type: isCoin
            ? 'coin'
            : 'penalty',

          size: isCoin ? 20 : 18
        })
      }

      /*
       * UPDATE OBJECTS
       */
      objectsRef.current =
        objectsRef.current.filter(obj => {
          obj.y +=
            3 +
            currentScore * 0.02

          /*
           * COLLISION
           */
          const currentPlayerX =
            playerXRef.current

          const dx =
            obj.x -
            currentPlayerX

          const dy =
            obj.y -
            PLAYER_Y

          const distance =
            Math.sqrt(
              dx * dx +
              dy * dy
            )

          if (
            distance <
            obj.size + 20
          ) {
            if (
              obj.type === 'coin'
            ) {
              currentScore += 50
            } else {
              currentScore =
                Math.max(
                  0,
                  currentScore - 30
                )
            }

            setScore(currentScore)

            return false
          }

          /*
           * DRAW COIN
           */
          if (
            obj.type === 'coin'
          ) {
            ctx.fillStyle = '#fbbf24'

            ctx.beginPath()

            ctx.arc(
              obj.x,
              obj.y,
              obj.size / 2,
              0,
              Math.PI * 2
            )

            ctx.fill()

            ctx.fillStyle = '#000'

            ctx.font =
              'bold 12px sans-serif'

            ctx.textAlign = 'center'

            ctx.fillText(
              'EFC',
              obj.x,
              obj.y + 4
            )
          }

          /*
           * DRAW PENALTY
           */
          else {
            ctx.fillStyle = '#ef4444'

            ctx.beginPath()

            ctx.moveTo(
              obj.x,
              obj.y - obj.size / 2
            )

            ctx.lineTo(
              obj.x + obj.size / 2,
              obj.y + obj.size / 2
            )

            ctx.lineTo(
              obj.x - obj.size / 2,
              obj.y + obj.size / 2
            )

            ctx.closePath()

            ctx.fill()
          }

          return (
            obj.y <
            canvas.height + 30
          )
        })

      /*
       * DRAW PLAYER / WALLET
       */
      const currentPlayerX =
        playerXRef.current

      /*
       * Wallet shadow
       */
      ctx.fillStyle =
        'rgba(0, 0, 0, 0.35)'

      ctx.fillRect(
        currentPlayerX - 25,
        PLAYER_Y + 5,
        50,
        30
      )

      /*
       * Wallet body
       */
      ctx.fillStyle = '#3b82f6'

      ctx.fillRect(
        currentPlayerX - 25,
        PLAYER_Y,
        PLAYER_WIDTH,
        PLAYER_HEIGHT
      )

      /*
       * Wallet top
       */
      ctx.fillStyle = '#1e40af'

      ctx.fillRect(
        currentPlayerX - 20,
        PLAYER_Y - 5,
        40,
        5
      )

      /*
       * Wallet label
       */
      ctx.fillStyle = '#fff'

      ctx.font =
        'bold 10px sans-serif'

      ctx.textAlign = 'center'

      ctx.fillText(
        'WALLET',
        currentPlayerX,
        PLAYER_Y + 19
      )

      /*
       * HUD
       */
      ctx.fillStyle = '#fff'

      ctx.font =
        'bold 16px sans-serif'

      ctx.textAlign = 'left'

      ctx.fillText(
        `Score: ${currentScore}`,
        10,
        25
      )

      ctx.textAlign = 'right'

      ctx.fillText(
        `Time: ${Math.ceil(currentTime)}s`,
        canvas.width - 10,
        25
      )

      /*
       * CONTINUE LOOP
       */
      animRef.current =
        requestAnimationFrame(gameLoop)
    }

    animRef.current =
      requestAnimationFrame(gameLoop)

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(
          animRef.current
        )
      }
    }
  }, [gameState, session])

  /*
   * KEYBOARD CONTROLS
   *
   * ArrowLeft / A
   * ArrowRight / D
   */
  useEffect(() => {
    const handleKey = (
      e: KeyboardEvent
    ) => {
      if (
        gameState !== 'playing'
      ) {
        return
      }

      const key =
        e.key.toLowerCase()

      if (
        key === 'arrowleft' ||
        key === 'a'
      ) {
        e.preventDefault()

        updatePlayerX(
          playerXRef.current - 25
        )
      }

      if (
        key === 'arrowright' ||
        key === 'd'
      ) {
        e.preventDefault()

        updatePlayerX(
          playerXRef.current + 25
        )
      }
    }

    window.addEventListener(
      'keydown',
      handleKey
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKey
      )
    }
  }, [gameState, updatePlayerX])

  /*
   * MOUSE CONTROLS
   *
   * Move wallet directly
   * according to mouse position
   */
  const handleMouseMove =
    useCallback(
      (
        e: React.MouseEvent<HTMLCanvasElement>
      ) => {
        if (
          gameState !== 'playing'
        ) {
          return
        }

        const canvas =
          canvasRef.current

        if (!canvas) {
          return
        }

        const rect =
          canvas.getBoundingClientRect()

        /*
         * Convert screen coordinates
         * into canvas coordinates.
         *
         * This also handles responsive
         * canvas scaling.
         */
        const scaleX =
          canvas.width /
          rect.width

        const mouseX =
          (e.clientX - rect.left) *
          scaleX

        updatePlayerX(mouseX)
      },
      [gameState, updatePlayerX]
    )

  /*
   * TOUCH CONTROLS
   */
  const handleTouch =
    useCallback(
      (
        e: React.TouchEvent<HTMLCanvasElement>
      ) => {
        if (
          gameState !== 'playing'
        ) {
          return
        }

        const canvas =
          canvasRef.current

        if (!canvas) {
          return
        }

        const rect =
          canvas.getBoundingClientRect()

        const scaleX =
          canvas.width /
          rect.width

        const touchX =
          (e.touches[0].clientX -
            rect.left) *
          scaleX

        updatePlayerX(touchX)
      },
      [gameState, updatePlayerX]
    )

  /*
   * MOUSE LEAVE
   *
   * Nothing happens here.
   * Wallet stays at last position.
   */
  const handleMouseLeave =
    useCallback(() => {
      if (
        gameState !== 'playing'
      ) {
        return
      }
    }, [gameState])

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-white">
        EFC Game
      </h1>

      {/* BALANCE */}
      <div className="bg-efc-card border border-slate-700 rounded-xl p-4">

        <p className="text-efc-muted text-sm">
          Current Balance
        </p>

        <p className="text-2xl font-bold text-white">
          {wallet?.balance?.toLocaleString() || 0} EFC
        </p>

      </div>

      {/* GAME CARD */}
      <div className="bg-efc-card border border-slate-700 rounded-xl p-6">

        {/* IDLE */}
        {gameState === 'idle' && (
          <div className="text-center py-8">

            <Gamepad2 className="w-16 h-16 text-efc-accent mx-auto mb-4" />

            <h3 className="text-2xl font-semibold text-white mb-2">
              Crypto Catch
            </h3>

            <p className="text-efc-muted mb-6 max-w-md mx-auto">
              Catch falling EFC coins with your wallet.
              Avoid red penalty triangles.
              Use your mouse, Arrow Keys, A/D, or touch to move.
              Game lasts 45 seconds.
            </p>

            <button
              onClick={handleStart}
              className="px-8 py-3 bg-efc-accent hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              Start Game
            </button>

          </div>
        )}

        {/* PLAYING */}
        {gameState === 'playing' && (
          <div className="text-center">

            {/* HUD */}
            <div className="flex items-center justify-center gap-6 mb-4">

              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-efc-warning" />

                <span className="text-xl font-bold text-white">
                  {score}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-efc-accent" />

                <span className="text-xl font-bold text-white">
                  {timeLeft}s
                </span>
              </div>

            </div>

            {/* CONTROL HINT */}
            <div className="flex items-center justify-center gap-2 text-sm text-efc-muted mb-3">
              <MousePointer2 className="w-4 h-4" />

              <span>
                Move your mouse over the game to control the wallet
              </span>
            </div>

            {/* CANVAS */}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="mx-auto border-2 border-slate-600 rounded-lg touch-none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouch}
              onTouchStart={handleTouch}
            />

            <p className="text-sm text-efc-muted mt-3">
              🖱️ Mouse &nbsp;•&nbsp;
              ⬅️➡️ Arrow Keys &nbsp;•&nbsp;
              A / D &nbsp;•&nbsp;
              📱 Touch
            </p>

          </div>
        )}

        {/* ENDED */}
        {gameState === 'ended' && result && (
          <div className="text-center py-8">

            <Trophy className="w-16 h-16 text-efc-warning mx-auto mb-4" />

            <h3 className="text-2xl font-semibold text-white mb-2">
              Game Over!
            </h3>

            <p className="text-3xl font-bold text-white mb-2">
              Score: {result.score}
            </p>

            {result.reward > 0 ? (
              <p className="text-xl text-efc-success mb-6">
                You earned +{result.reward} EFC!
              </p>
            ) : (
              <p className="text-xl text-efc-muted mb-6">
                No reward this time. Try again!
              </p>
            )}

            <button
              onClick={handleStart}
              className="px-8 py-3 bg-efc-accent hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>

          </div>
        )}

      </div>

      {/* INFO */}
      <p className="text-center text-sm text-efc-muted">
        Game rewards are educational EFC rewards inside the Elfaidy Coin ecosystem.
      </p>

      {/* HISTORY */}
      {history.length > 0 && (
        <div className="bg-efc-card border border-slate-700 rounded-xl overflow-hidden">

          <div className="p-4 border-b border-slate-700">

            <h3 className="text-lg font-semibold text-white">
              Game History
            </h3>

          </div>

          <div className="divide-y divide-slate-700">

            {history
              .slice(0, 10)
              .map(h => (
                <div
                  key={h.id}
                  className="p-4 flex items-center justify-between"
                >

                  <div>

                    <p className="text-white text-sm">
                      {new Date(
                        h.started_at
                      ).toLocaleDateString()}
                    </p>

                    <code className="text-xs text-efc-muted font-mono">
                      {h.session_id.slice(
                        0,
                        16
                      )}
                      ...
                    </code>

                  </div>

                  <div className="text-right">

                    <p className="text-white font-semibold">
                      Score: {h.score || 0}
                    </p>

                    {h.rewarded && (
                      <p className="text-efc-success text-sm">
                        +{h.reward} EFC
                      </p>
                    )}

                  </div>

                </div>
              ))}

          </div>

        </div>
      )}

    </div>
  )
}


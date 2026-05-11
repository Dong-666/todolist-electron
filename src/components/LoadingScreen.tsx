import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)

  const tips = [
    '番茄钟模式',
    'github gist云同步',
    '支持快速添加待办',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          return 100
        }
        return p + 2
      })
      setTipIndex(i => (i + 1) % tips.length)
    }, 1 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden relative flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="grid-pattern" />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20" style={{
        background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
        filter: 'blur(80px)',
        transform: 'translate(-50%, -50%)',
      }} />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-15" style={{
        background: 'radial-gradient(circle, var(--priority-medium) 0%, transparent 70%)',
        filter: 'blur(100px)',
        transform: 'translate(50%, 50%)',
      }} />

      {/* Main loading card */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo/Icon area */}
        <div className="relative mb-8">
          {/* Todo checklist icon */}
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="drop-shadow-lg">
            {/* Paper background */}
            <rect x="10" y="6" width="52" height="60" rx="8" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2" opacity="0.9"/>

            {/* Checkmark circle */}
            <circle cx="36" cy="32" r="16" fill="var(--accent)" opacity="0.15" />
            <circle cx="36" cy="32" r="12" stroke="var(--accent)" strokeWidth="2.5" fill="none" />

            {/* Animated checkmark */}
            <path
              d="M29 32L33 36L43 26"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={progress > 30 ? 'opacity-100' : 'opacity-0'}
              style={{
                strokeDasharray: 24,
                strokeDashoffset: progress > 30 ? 0 : 24,
                transition: 'stroke-dashoffset 400ms ease-out'
              }}
            />

            {/* Progress bar under checkmark */}
            <rect x="16" y="52" width="40" height="4" rx="2" fill="var(--bg-tertiary)" />
            <rect
              x="16"
              y="52"
              width={Math.min(progress, 100) * 0.4}
              height="4"
              rx="2"
              fill="var(--accent)"
              style={{
                transition: 'width 100ms ease-out'
              }}
            />

            {/* Corner fold */}
            <path d="M50 6 L62 6 L62 18 Z" fill="var(--bg-tertiary)" />
            <path d="M50 6 L50 18 L62 18" fill="var(--border)" />
          </svg>

          {/* Floating particles */}
          <div className="absolute -top-2 -right-2 w-2 h-2 rounded-full" style={{ background: 'var(--accent)', animation: 'float 3s ease-in-out infinite', animationDelay: '0s' }} />
          <div className="absolute -bottom-1 -left-3 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--priority-medium)', animation: 'float 3s ease-in-out infinite', animationDelay: '1s' }} />
          <div className="absolute top-1/2 -right-4 w-1 h-1 rounded-full" style={{ background: 'var(--priority-low)', animation: 'float 3s ease-in-out infinite', animationDelay: '2s' }} />
        </div>

        {/* Title */}
        <h1 className="text-title text-2xl font-semibold mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
          待办事项
        </h1>
        <p className="text-caption mb-8" style={{ color: 'var(--text-tertiary)' }}>
          开启你的一天
        </p>

        {/* Progress indicator */}
        <div className="w-48 mb-6">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%)',
                transition: 'width 150ms ease-out'
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>
              {progress < 50 ? '正在加载...' : progress < 90 ? '同步数据...' : '准备完成...'}
            </span>
            <span className="text-caption font-mono" style={{ color: 'var(--accent)' }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Tips */}
        <div className="h-5 overflow-hidden">
          <p
            key={tipIndex}
            className="text-caption text-center transition-all duration-300"
            style={{ color: 'var(--text-secondary)' }}
          >
            {tips[tipIndex]}
          </p>
        </div>
      </div>

      {/* Version tag */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>
          v1.0.0
        </span>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-8px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
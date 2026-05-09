import { motion } from 'framer-motion'

interface TitleBarProps {
  onSettingsClick: () => void
}

export default function TitleBar({ onSettingsClick }: TitleBarProps) {
  return (
    <div className="h-11 flex items-center justify-between px-4">
      {/* Left section */}
      <div className="flex items-center gap-3 no-drag">
        <motion.button
          onClick={onSettingsClick}
          className="settings-btn w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="设置"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.4 1.4M11.55 11.55l1.4 1.4M3.05 12.95l1.4-1.4M11.55 4.45l1.4-1.4" />
          </svg>
        </motion.button>
      </div>

      {/* Center - drag region */}
      <div className="flex-1 flex justify-center drag-region">
        <div
          className="px-3 py-1 rounded-full"
          style={{ background: 'var(--accent-soft)' }}
        >
          <span className="text-xs font-semibold tracking-wider" style={{ color: 'var(--accent)' }}>
            TODO
          </span>
        </div>
      </div>

      {/* Right section - window controls */}
      <div className="flex items-center gap-1.5 no-drag">
        <motion.button
          onClick={() => window.electronAPI.windowMinimize()}
          className="w-9 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ color: 'var(--text-tertiary)' }}
          whileHover={{ scale: 1.1, backgroundColor: 'var(--bg-tertiary)' }}
          whileTap={{ scale: 0.9 }}
          title="最小化"
        >
          <svg width="10" height="2" viewBox="0 0 10 2" fill="var(--text-tertiary)">
            <rect width="10" height="2" rx="1" />
          </svg>
        </motion.button>

        <motion.button
          onClick={() => window.electronAPI.windowMaximize()}
          className="w-9 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ color: 'var(--text-tertiary)' }}
          whileHover={{ scale: 1.1, backgroundColor: 'var(--bg-tertiary)' }}
          whileTap={{ scale: 0.9 }}
          title="最大化"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
            <rect x="1" y="1" width="8" height="8" rx="2" />
          </svg>
        </motion.button>

        <motion.button
          onClick={() => window.electronAPI.windowClose()}
          className="w-9 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ color: 'var(--text-tertiary)' }}
          whileHover={{ scale: 1.1, backgroundColor: '#ef4444', color: 'white' }}
          whileTap={{ scale: 0.9 }}
          title="关闭"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" stroke="var(--text-tertiary)" strokeWidth="1.5">
            <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" />
            <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'

interface TitleBarProps {
  onSettingsClick: () => void
}

export default function TitleBar({ onSettingsClick }: TitleBarProps) {
  return (
    <div className="h-11 flex items-center justify-between px-4 theme-transition drag-region" style={{ background: 'transparent' }}>
      {/* Left section - no drag for interactive elements */}
      <div className="flex items-center gap-4 no-drag">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onSettingsClick}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.4 1.4M11.55 11.55l1.4 1.4M3.05 12.95l1.4-1.4M11.55 4.45l1.4-1.4" />
          </svg>
        </motion.button>
      </div>

      {/* Center - drag region for window dragging */}
      <div className="flex-1 flex justify-center drag-region">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-1 rounded-full"
          style={{ background: 'var(--accent-soft)' }}
        >
          <span className="text-xs font-semibold tracking-wider" style={{ color: 'var(--accent)' }}>
            TODO
          </span>
        </motion.div>
      </div>

      {/* Right section - no drag for window controls */}
      <div className="flex items-center gap-1.5 no-drag">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.electronAPI.windowMinimize()}
          className="w-9 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
          title="最小化"
        >
          <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor" className="text-gray-500">
            <rect width="10" height="2" rx="1" />
          </svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.electronAPI.windowMaximize()}
          className="w-9 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
          title="最大化"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
            <rect x="1" y="1" width="8" height="8" rx="2" />
          </svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.electronAPI.windowClose()}
          className="w-9 h-8 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-all group"
          title="关闭"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" className="text-gray-500 group-hover:text-white">
            <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" />
            <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}

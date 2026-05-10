import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { FOCUS_DURATION, BREAK_DURATION } from '../utils/pomodoro'

export default function FocusModal() {
  const { focusMode, focusTodoId, focusTimeRemaining, focusStatus, todos, pauseFocus, resumeFocus, endFocus, tickFocus } = useStore()
  const intervalRef = useRef<number | null>(null)

  const todo = todos.find(t => t.id === focusTodoId)

  useEffect(() => {
    if (focusMode && focusStatus === 'working' || focusStatus === 'break') {
      intervalRef.current = window.setInterval(() => {
        tickFocus()
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [focusMode, focusStatus, tickFocus])

  useEffect(() => {
    if (focusTimeRemaining === 0 && focusStatus === 'break') {
      new window.Notification('🍅 休息结束', { body: `${BREAK_DURATION / 60}分钟休息已结束，准备开始下一轮专注` })
    } else if (focusTimeRemaining === 0 && focusStatus === 'working') {
      new window.Notification('🍅 专注完成', { body: `${FOCUS_DURATION / 60}分钟专注结束！休息一下吧` })
    }
  }, [focusTimeRemaining, focusStatus])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const getStatusLabel = () => {
    switch (focusStatus) {
      case 'working': return '🍅 专注中'
      case 'break': return '☕ 休息中'
      case 'paused': return '⏸️ 已暂停'
      default: return '🍅 番茄钟'
    }
  }

  const getProgressColor = () => {
    switch (focusStatus) {
      case 'working': return 'var(--accent)'
      case 'break': return '#10B981'
      case 'paused': return 'var(--text-tertiary)'
      default: return 'var(--accent)'
    }
  }

  const handleClose = () => {
    endFocus()
  }

  const progress = focusStatus === 'working'
    ? ((FOCUS_DURATION - focusTimeRemaining) / FOCUS_DURATION) * 100
    : focusStatus === 'break'
    ? ((BREAK_DURATION - focusTimeRemaining) / BREAK_DURATION) * 100
    : 0

  if (!focusMode) return null

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-[420px] p-8 rounded-2xl text-center"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)'
        }}
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.h2
          className="text-xl font-semibold mb-2"
          style={{ color: getProgressColor() }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {getStatusLabel()}
        </motion.h2>

        {todo && (
          <motion.p
            className="text-sm mb-8"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            📋 {todo.title}
          </motion.p>
        )}

        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="var(--bg-tertiary)"
              strokeWidth="4"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={getProgressColor()}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatTime(focusTimeRemaining)}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          {focusStatus === 'working' || focusStatus === 'break' ? (
            <motion.button
              onClick={pauseFocus}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-medium text-sm"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              ⏸️ 暂停
            </motion.button>
          ) : focusStatus === 'paused' ? (
            <motion.button
              onClick={resumeFocus}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-medium text-sm btn-primary"
            >
              ▶️ 继续
            </motion.button>
          ) : null}

          <motion.button
            onClick={handleClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl font-medium text-sm"
            style={{ background: 'var(--priority-high)', color: 'white' }}
          >
            结束专注
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
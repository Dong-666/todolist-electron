import { motion } from 'framer-motion'

interface ActionButtonProps {
  icon: React.ReactNode
  onClick: () => void
  color?: string
  hoverBg?: string
  title?: string
  /** 控制显示/隐藏 */
  visible?: boolean
}

export default function ActionButton({
  icon,
  onClick,
  color = 'var(--text-tertiary)',
  hoverBg = 'rgba(59, 130, 246, 0.12)',
  title,
  visible = true,
}: ActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1'
        e.currentTarget.style.background = hoverBg
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.8'
        e.currentTarget.style.background = 'transparent'
      }}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
      style={{ color, opacity: visible ? 0.8 : 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={title}
    >
      {icon}
    </motion.button>
  )
}
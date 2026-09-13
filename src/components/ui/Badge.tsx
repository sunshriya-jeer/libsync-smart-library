import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline'
  size?: 'sm' | 'md'
  className?: string
  dot?: boolean
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
  dot = false,
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200/80',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    outline: 'bg-transparent text-slate-600 border-slate-200',
  }

  const dotStyles = {
    default: 'bg-slate-500',
    primary: 'bg-indigo-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    outline: 'bg-slate-400',
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[variant])} />}
      {children}
    </span>
  )
}

import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isBlock?: boolean
  children: ReactNode
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  ghost: 'btn btn--ghost',
  danger: 'btn btn--danger',
}

/** Botão com profundidade (borda inferior) no padrão de ação do Nuri. */
export function PrimaryButton({
  variant = 'primary',
  isBlock = false,
  className = '',
  type = 'button',
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`${VARIANT_CLASS[variant]}${isBlock ? ' btn--block' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    >
      <span className="btn__label">{children}</span>
    </button>
  )
}

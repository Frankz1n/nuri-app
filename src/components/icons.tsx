import type { ReactNode } from 'react'

interface IconProps {
  size?: number
}

function BaseIcon({ size = 24, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const LearnIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M12 20V10" />
    <path d="M12 12c0-4 3-6 7-6 0 4-3 7-7 6Z" />
    <path d="M12 14c0-3-2-5-6-5 0 3 2 6 6 5Z" />
  </BaseIcon>
)

export const PracticeIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.2" />
  </BaseIcon>
)

export const AlphabetIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M5 6h10v3c0 5-3 8-6 9" />
    <path d="M18 5v14" />
    <path d="M18 12h3" />
  </BaseIcon>
)

export const WordsIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M4 5h16v11H9l-5 4V5Z" />
    <path d="M8 10h8" />
  </BaseIcon>
)

export const ProfileIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
  </BaseIcon>
)

export const BackIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M15 5l-7 7 7 7" />
  </BaseIcon>
)

export const StarIcon = ({ size = 24, isFilled = false }: IconProps & { isFilled?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={isFilled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8L12 3Z" />
  </svg>
)

export const CheckIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </BaseIcon>
)

export const FlameIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9Z" />
  </BaseIcon>
)

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

export type SkillGlyph = 'listen' | 'speak' | 'read' | 'write' | 'blocks' | 'review' | 'video'

export function SkillIcon({ kind, size }: IconProps & { kind: SkillGlyph }) {
  const marks: Record<SkillGlyph, ReactNode> = {
    listen: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="4" y="12" width="4" height="7" rx="1.5" /><rect x="16" y="12" width="4" height="7" rx="1.5" /></>,
    speak: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11v1a6.5 6.5 0 0 0 13 0v-1M12 18.5V22m-3 0h6" /></>,
    read: <><path d="M12 6.5c-2-2-5-2.5-9-2v14c4-.5 7 0 9 2 2-2 5-2.5 9-2v-14c-4-.5-7 0-9 2Zm0 0v14" /></>,
    write: <><path d="m5 16-1 4 4-1L20 7l-3-3L5 16Zm10-10 3 3M12 21h9" /></>,
    blocks: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /><path d="M15 5h4m-2-2v4M5 17h4" /></>,
    review: <><path d="M5 8a8 8 0 1 1-.7 6M5 8V3m0 5h5" /></>,
    video: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m10 9 5 3-5 3V9Z" /></>,
  }
  return <BaseIcon size={size}>{marks[kind]}</BaseIcon>
}

export const ChevronIcon = (props: IconProps) => (
  <BaseIcon {...props}><path d="m9 5 7 7-7 7" /></BaseIcon>
)

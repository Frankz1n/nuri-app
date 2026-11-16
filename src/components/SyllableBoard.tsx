import { useState } from 'react'
import type { SyllableLayout } from '../lib/steps'

interface SyllableBoardProps {
  bank: readonly string[]
  slotCount: number
  layout: SyllableLayout
  isDisabled?: boolean
  isSolved?: boolean
  composed?: string
  onChange: (selectedValues: string[]) => void
}

const SLOT_LABELS = ['primeira peça', 'segunda peça', 'terceira peça'] as const

/**
 * Quadro de montagem no ritmo do vídeo: frame pontilhado, slot ativo,
 * peças no banco e transformação em bloco único no acerto.
 */
export function SyllableBoard({
  bank,
  slotCount,
  layout,
  isDisabled = false,
  isSolved = false,
  composed,
  onChange,
}: SyllableBoardProps) {
  const [slotBankIndexes, setSlotBankIndexes] = useState<(number | null)[]>(() =>
    Array.from({ length: slotCount }, () => null),
  )

  const publish = (nextSlots: (number | null)[]): void => {
    setSlotBankIndexes(nextSlots)
    onChange(nextSlots.flatMap((bankIndex) => (bankIndex === null ? [] : [bank[bankIndex]])))
  }

  const firstEmptySlot = slotBankIndexes.findIndex((slot) => slot === null)

  const placeTile = (bankIndex: number): void => {
    if (isDisabled || isSolved || slotBankIndexes.includes(bankIndex) || firstEmptySlot < 0) return
    const next = [...slotBankIndexes]
    next[firstEmptySlot] = bankIndex
    publish(next)
  }

  const clearSlot = (slotIndex: number): void => {
    if (isDisabled || isSolved) return
    const next = [...slotBankIndexes]
    next[slotIndex] = null
    publish(next)
  }

  if (isSolved && composed) {
    return (
      <div className="syllable-board syllable-board--solved">
        <div className="syllable-board__result" aria-label={`Bloco montado: ${composed}`}>
          <span className="syllable-board__composed" lang="ko">
            {composed}
          </span>
        </div>
        <div className="syllable-board__bank syllable-board__bank--ghost" aria-hidden="true">
          {bank.map((_, bankIndex) => (
            <span key={`ghost-${bankIndex}`} className="tile tile--ghost" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="syllable-board">
      <div
        className={`syllable-board__frame syllable-board__slots syllable-board__slots--${layout}`}
        role="group"
        aria-label="Espaços do bloco"
      >
        {slotBankIndexes.map((bankIndex, slotIndex) => {
          const value = bankIndex === null ? null : bank[bankIndex]
          const isFilled = value !== null
          const isActive = !isFilled && slotIndex === firstEmptySlot
          return (
            <button
              key={`slot-${slotIndex}`}
              type="button"
              className={`syllable-slot${isFilled ? ' is-filled' : ''}${isActive ? ' is-active' : ''}`}
              lang={isFilled ? 'ko' : undefined}
              disabled={isDisabled || !isFilled}
              aria-label={
                isFilled
                  ? `Remover ${value} da ${SLOT_LABELS[slotIndex] ?? `posição ${slotIndex + 1}`}`
                  : `Espaço vazio · ${SLOT_LABELS[slotIndex] ?? `posição ${slotIndex + 1}`}${isActive ? ' · próximo' : ''}`
              }
              onClick={() => clearSlot(slotIndex)}
            >
              {value ?? ''}
            </button>
          )
        })}
      </div>

      <div className="syllable-board__bank" role="group" aria-label="Peças disponíveis">
        {bank.map((value, bankIndex) => {
          const isUsed = slotBankIndexes.includes(bankIndex)
          if (isUsed) {
            return <span key={`bank-${bankIndex}`} className="tile tile--ghost" aria-hidden="true" />
          }
          return (
            <button
              key={`bank-${bankIndex}`}
              type="button"
              className="tile tile--depth"
              lang="ko"
              disabled={isDisabled}
              aria-label={`Peça ${value}`}
              onClick={() => placeTile(bankIndex)}
            >
              {value}
            </button>
          )
        })}
      </div>
    </div>
  )
}

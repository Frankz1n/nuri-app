import { useState } from 'react'
import { joinTiles } from '../lib/tiles'
import type { TextLanguage, TilesStep } from '../lib/steps'

interface TileBoardProps {
  bank: readonly string[]
  tileLanguage: TextLanguage
  join: TilesStep['join']
  isDisabled?: boolean
  onChange: (selectedValues: string[]) => void
}

/** Peças tocáveis: dispensa teclado coreano. Peças repetidas são distinguidas pela posição no banco. */
export function TileBoard({ bank, tileLanguage, join, isDisabled = false, onChange }: TileBoardProps) {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([])
  const languageAttribute = tileLanguage === 'ko' ? 'ko' : undefined

  const update = (nextIndexes: number[]): void => {
    setSelectedIndexes(nextIndexes)
    onChange(nextIndexes.map((bankIndex) => bank[bankIndex]))
  }

  const selectedValues = selectedIndexes.map((bankIndex) => bank[bankIndex])

  return (
    <div className="tile-board">
      <div className="tile-board__answer" aria-label="Sua resposta">
        {selectedIndexes.length === 0 ? <span className="tile-board__placeholder">Toque nas peças abaixo</span> : null}
        {selectedIndexes.map((bankIndex, position) => (
          <button
            key={`${bankIndex}-${position}`}
            type="button"
            className="tile tile--selected"
            lang={languageAttribute}
            disabled={isDisabled}
            aria-label={`Remover ${bank[bankIndex]}`}
            onClick={() => update(selectedIndexes.filter((_, selectedPosition) => selectedPosition !== position))}
          >
            {bank[bankIndex]}
          </button>
        ))}
      </div>

      {join === 'jamo' && selectedValues.length > 0 ? (
        <p className="tile-board__preview" lang="ko" aria-label={`Bloco formado: ${joinTiles(selectedValues, join)}`}>
          {joinTiles(selectedValues, join)}
        </p>
      ) : null}

      <div className="tile-board__bank" role="group" aria-label="Peças disponíveis">
        {bank.map((value, bankIndex) => (
          <button
            // Posição no banco é a identidade da peça (valores podem se repetir).
            key={bankIndex}
            type="button"
            className="tile"
            lang={languageAttribute}
            disabled={isDisabled || selectedIndexes.includes(bankIndex)}
            onClick={() => update([...selectedIndexes, bankIndex])}
          >
            {value}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="button button--ghost"
        disabled={isDisabled || selectedIndexes.length === 0}
        onClick={() => update([])}
      >
        Limpar peças
      </button>
    </div>
  )
}

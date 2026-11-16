import type { LiveSituation } from '../data/live'
import { shuffle } from './random'
import type { Random } from './random'
import type { LiveListeningStep } from './steps'

export const buildLiveListeningStep = (
  situation: LiveSituation,
  take: LiveListeningStep['take'],
  random: Random,
): LiveListeningStep => {
  const options = shuffle([situation[take].pt, ...situation.distractors], random)
  return {
    kind: 'live-listen',
    skillId: take === 'transfer' ? 'listening-transfer' : 'listening',
    errorId: `live-listen:${situation.id}:${take}`,
    situationId: situation.id,
    take,
    options,
    answerIndex: options.indexOf(situation[take].pt),
  }
}

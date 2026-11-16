import cheer from './cheer.png'
import confident from './confident.png'
import idea from './idea.png'
import jump from './jump.png'
import nervous from './nervous.png'
import wave from './wave.png'
import waveCalm from './wave-calm.png'
import worried from './worried.png'
import horangi from './horangi.webp'

export const MASCOT_POSES = {
  cheer,
  confident,
  idea,
  jump,
  nervous,
  wave,
  waveCalm,
  worried,
  default: horangi,
} as const

export type MascotPose = keyof typeof MASCOT_POSES

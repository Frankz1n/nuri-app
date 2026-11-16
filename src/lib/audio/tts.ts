let voicesReady: Promise<void> | null = null

const waitForVoices = (): Promise<void> => {
  if (voicesReady) return voicesReady
  voicesReady = new Promise((resolve) => {
    const speech = window.speechSynthesis
    if (!speech) {
      resolve()
      return
    }
    if (speech.getVoices().length > 0) {
      resolve()
      return
    }
    const onChange = () => {
      speech.removeEventListener('voiceschanged', onChange)
      resolve()
    }
    speech.addEventListener('voiceschanged', onChange)
    window.setTimeout(() => {
      speech.removeEventListener('voiceschanged', onChange)
      resolve()
    }, 1500)
  })
  return voicesReady
}

export const getLocalKoreanVoice = (): SpeechSynthesisVoice | undefined =>
  window.speechSynthesis?.getVoices().find((voice) => voice.localService && /^ko(?:-|_|$)/i.test(voice.lang)) ??
  window.speechSynthesis?.getVoices().find((voice) => /^ko(?:-|_|$)/i.test(voice.lang))

export interface SpeakKoreanResult {
  ok: boolean
  message?: string
}

/** Fala hangul via voz coreana do aparelho (fallback até termos MP3). */
export const speakKorean = async (text: string, rate = 0.9): Promise<SpeakKoreanResult> => {
  const speech = window.speechSynthesis
  if (!speech) return { ok: false, message: 'Este aparelho não tem síntese de voz.' }

  await waitForVoices()
  const voice = getLocalKoreanVoice()
  if (!voice) {
    return { ok: false, message: 'Não encontramos uma voz coreana neste aparelho.' }
  }

  return new Promise((resolve) => {
    speech.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice
    utterance.lang = voice.lang
    utterance.rate = rate
    utterance.onend = () => resolve({ ok: true })
    utterance.onerror = () => resolve({ ok: false, message: 'Não deu pra tocar a pronúncia agora.' })
    try {
      speech.speak(utterance)
    } catch {
      resolve({ ok: false, message: 'Não deu pra tocar a pronúncia agora.' })
    }
  })
}

export const stopKoreanSpeech = (): void => {
  window.speechSynthesis?.cancel()
}

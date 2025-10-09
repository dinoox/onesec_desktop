/**
 * 声音播放服务
 * 负责在特定时机播放音效
 */

type SoundType = 'open' | 'close' | 'notification'

const MIN_VOLUME_THRESHOLD = 0.01
const MAX_VOLUME_THRESHOLD = 0.1

class SoundService {
  private audioContext: AudioContext | null = null
  private sounds: Map<SoundType, AudioBuffer> = new Map()
  private isInitialized = false

  constructor() {}

  async initialize() {
    if (this.isInitialized) {
      return
    }

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    await this.preloadSounds()

    this.isInitialized = true
    console.log(`[SoundService] Initialized`)
  }

  private async preloadSounds() {
    const soundFiles: Record<SoundType, string> = {
      open: new URL('../assets/sounds/open.wav', import.meta.url).href,
      close: new URL('../assets/sounds/close.wav', import.meta.url).href,
      notification: new URL('../assets/sounds/notification.wav', import.meta.url).href,
    }

    for (const [soundType, filePath] of Object.entries(soundFiles)) {
      try {
        this.sounds.set(soundType as SoundType, await this.loadAudioFile(filePath))
      } catch (err) {
        console.error(`[SoundService] preload sound ${soundType} err: `, err)
      }
    }
  }

  private async loadAudioFile(filePath: string): Promise<AudioBuffer> {
    const audioRes = await fetch(filePath)
    if (!audioRes.ok) {
      throw new Error(`Failed to fetch audio file: ${audioRes.status}`)
    }

    const arrayBuffer = await audioRes.arrayBuffer()
    return await this.audioContext!.decodeAudioData(arrayBuffer, null, () => {
      throw new Error(`Decode audio file: ${filePath} error`)
    })
  }

  async playSound(soundType: SoundType, volume: number = 0.5) {
    if (!this.isInitialized || !this.audioContext) {
      return
    }

    const audioBuffer = this.sounds.get(soundType)
    if (!audioBuffer) {
      console.warn(`[SoundService] Sound ${soundType} not loaded, skipping playback`)
      return
    }

    try {
      // 恢复音频上下文（如果被暂停）
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // 创建音频源
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer

      // 创建增益节点控制音量
      const gainNode = this.audioContext.createGain()
      gainNode.gain.value = Math.max(0, Math.min(1, volume))

      // 连接音频节点
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // 播放音频
      source.start()

      console.log(
        `[SoundService] Successfully started playing sound: ${soundType} at volume ${volume}`,
      )
    } catch (err) {
      console.error(`[SoundService] Error playing sound ${soundType}:`, err)
    }
  }

  async playStartRecording(): Promise<void> {
    await this.playSound('open', 0.3)
  }

  async playStopRecording(): Promise<void> {
    await this.playSound('close', 0.3)
  }

  async playNotification(): Promise<void> {
    await this.playSound('notification', 0.4)
  }

  normalizeVolumeValue(volume: number): number {
    if (!Number.isFinite(volume)) {
      return 0
    }
    if (volume <= MIN_VOLUME_THRESHOLD) {
      return 0
    }
    if (volume >= MAX_VOLUME_THRESHOLD) {
      return 1
    }
    return (volume - MIN_VOLUME_THRESHOLD) / (MAX_VOLUME_THRESHOLD - MIN_VOLUME_THRESHOLD)
  }

  async destroy() {
    if (this.audioContext) {
      await this.audioContext.close()
      this.audioContext = null
    }
    this.sounds.clear()
    this.isInitialized = false
  }
}

export default new SoundService()

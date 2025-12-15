import path from 'path'
import Database from 'better-sqlite3'
import userConfigManager from './user-config-manager'

export interface Audios {
  id: string
  session_id: string
  created_at: number
  filename: string
  error: string | null
  content: string
  user_id: number
  version: string
}

class DatabaseService {
  private db: Database.Database | null = null

  private getDb(): Database.Database {
    if (!this.db) {
      const configDir = path.dirname(userConfigManager.getConfigPath())
      const dbPath = path.join(configDir, 'db.sqlite3')
      this.db = new Database(dbPath, { readonly: false })
    }
    return this.db
  }

  private normalize(row: any): Audios {
    const rawCreatedAt = row.created_at
    const createdAtNumber = Number(rawCreatedAt)
    return {
      id: row.id,
      session_id: row.session_id,
      created_at: createdAtNumber,
      filename: row.filename,
      error: row.error || null,
      content: row.content || '',
      user_id: row.user_id,
      version: row.version || '',
    }
  }

  getAudios(): Audios[] {
    const db = this.getDb()
    const user = userConfigManager.getConfig().user
    if (!user) return []

    const stmt = db.prepare(
      'SELECT id, session_id, created_at, filename, error, content, user_id, version FROM audios WHERE user_id = ? ORDER BY created_at DESC',
    )
    const rows = stmt.all(user.user_id) as any[]
    return rows.map((row) => this.normalize(row))
  }

  deleteAudio(filename: string): boolean {
    const db = this.getDb()
    const user = userConfigManager.getConfig().user
    if (!user) return false

    const stmt = db.prepare('DELETE FROM audios WHERE filename = ? AND user_id = ?')
    let result = stmt.run(filename, user.user_id)
    return result.changes > 0
  }

  updateAudio(id: string, content: string, error: string | null = null): boolean {
    const db = this.getDb()
    const user = userConfigManager.getConfig().user
    if (!user) return false

    const stmt = db.prepare(
      'UPDATE audios SET content = ?, error = ? WHERE id = ? AND user_id = ?',
    )
    const result = stmt.run(content, error, id, user.user_id)
    return result.changes > 0
  }

  deleteAudiosByRetention(retention: string): number {
    const db = this.getDb()
    const user = userConfigManager.getConfig().user
    if (!user) return 0

    let stmt: Database.Statement
    let result: Database.RunResult

    switch (retention) {
      case 'never':
        stmt = db.prepare('DELETE FROM audios WHERE user_id = ?')
        result = stmt.run(user.user_id)
        break
      case '24hours': {
        const cutoffTime = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000)
        stmt = db.prepare('DELETE FROM audios WHERE created_at < ? AND user_id = ?')
        result = stmt.run(cutoffTime, user.user_id)
        break
      }
      case '1week': {
        const cutoffTime = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)
        stmt = db.prepare('DELETE FROM audios WHERE created_at < ? AND user_id = ?')
        result = stmt.run(cutoffTime, user.user_id)
        break
      }
      case '1month': {
        const cutoffTime = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
        stmt = db.prepare('DELETE FROM audios WHERE created_at < ? AND user_id = ?')
        result = stmt.run(cutoffTime, user.user_id)
        break
      }
      case 'forever':
      default:
        return 0
    }

    return result.changes
  }

  generateMockData(): number {
    const db = this.getDb()
    const user = userConfigManager.getConfig().user
    if (!user) return 0

    const mockContents = [
      '会议记录：讨论了项目进度和下一步计划',
      '语音备忘录：明天记得买菜',
      '电话会议内容：与客户沟通产品需求',
      '头脑风暴：新功能设计方案',
      '日常随记：今天的工作总结',
      '语音笔记：灵感想法记录',
      '会议纪要：技术方案讨论',
      '语音转文字：采访内容整理',
      '录音备忘：重要事项提醒',
      '语音日记：今天的心情记录',
      '工作笔记：bug修复方案',
      '团队会议：周报内容讨论',
      '客户沟通记录：需求确认',
      '产品讨论：用户体验优化',
      '技术分享：新技术学习笔记',
    ]

    const timePeriods = [
      { name: '今天', hours: 0, maxHours: 12 },
      { name: '昨天', hours: 24, maxHours: 48 },
      { name: '1周前', hours: 7 * 24, maxHours: 10 * 24 },
      { name: '1个月前', hours: 30 * 24, maxHours: 45 * 24 },
      { name: '3个月前', hours: 90 * 24, maxHours: 120 * 24 },
    ]

    let totalInserted = 0
    const stmt = db.prepare(
      'INSERT INTO audios (id, session_id, created_at, filename, error, content, user_id, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )

    timePeriods.forEach((period) => {
      const count = Math.floor(Math.random() * 5) + 8 // 8-12条
      for (let i = 0; i < count; i++) {
        const randomHoursOffset =
          period.hours + Math.random() * (period.maxHours - period.hours)
        const timestamp = Math.floor(
          (Date.now() - randomHoursOffset * 60 * 60 * 1000) / 1000,
        )
        const id = `mock_${timestamp}_${i}_${Math.random().toString(36).substr(2, 9)}`
        const sessionId = `session_${Math.random().toString(36).substr(2, 9)}`
        const filename = `audio_${timestamp}_${i}.wav`
        const content = mockContents[Math.floor(Math.random() * mockContents.length)]
        const hasError = Math.random() < 0.1 // 10% 的概率有错误
        const error = hasError ? '转换失败' : null
        const version = '1.0.0'

        try {
          stmt.run(
            id,
            sessionId,
            timestamp,
            filename,
            error,
            content,
            user.user_id,
            version,
          )
          totalInserted++
        } catch (err) {
          console.error('插入 mock 数据失败:', err)
        }
      }
    })

    return totalInserted
  }

  clearAllAudios(): number {
    const db = this.getDb()
    const user = userConfigManager.getConfig().user
    if (!user) return 0

    const stmt = db.prepare('DELETE FROM audios WHERE user_id = ?')
    const result = stmt.run(user.user_id)
    return result.changes
  }

  close() {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

export default new DatabaseService()

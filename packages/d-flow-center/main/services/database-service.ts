import path from 'path'
import fs from 'fs'
import Database from 'better-sqlite3'
import userConfigManager from './user-config-manager'
import log from 'electron-log'

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

export interface Persona {
  id: number
  user_id: number | null
  name: string
  description: string | null
  icon: string
  icon_svg?: string | null
  content: string
  is_example: boolean
  created_at: number | null
  updated_at: number | null
}

class DatabaseService {
  private db: Database.Database | null = null
  private initialized = false
  private cleanupTimer: NodeJS.Timeout | null = null

  private getDb(): Database.Database {
    if (!this.db) {
      const configDir = path.dirname(userConfigManager.getConfigPath())
      const dbPath = path.join(configDir, 'db.sqlite3')
      this.db = new Database(dbPath, { readonly: false })
    }
    if (!this.initialized) {
      this.initTables()
      this.initialized = true

      // 启动周期性清理任务
      this.startPeriodicCleanup()
      // this.generateMockData()
    }
    return this.db
  }

  private initTables(): void {
    if (!this.db) return

    // Create audios table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audios (
        id TEXT PRIMARY KEY,
        session_id TEXT,
        user_id INTEGER,
        created_at INTEGER,
        filename TEXT,
        content TEXT,
        error TEXT,
        version TEXT
      )
    `)

    // Create audios indexes
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_audios_created_at ON audios(created_at)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_audios_session_id ON audios(session_id)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_audios_user_id ON audios(user_id)`)

    // Create personas table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS personas (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT NOT NULL,
        icon_svg TEXT,
        content TEXT NOT NULL,
        is_example INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
      )
    `)
  }

  /**
   * 启动周期性清理任务，每天执行一次
   * @param intervalMs 清理间隔时间，默认为 24 小时
   */
  private startPeriodicCleanup(intervalMs: number = 12 * 60 * 60 * 1000): void {
    const cleanup = () => {
      try {
        const retention = userConfigManager.getConfig().setting?.history_retention
        if (!retention || retention === 'forever') {
          return
        }

        const deletedCount = this.cleanupAudiosByRetention(retention)
        if (deletedCount > 0) {
          log.info(
            `Database periodic cleanup: deleted ${deletedCount} expired audio records`,
          )
        }
      } catch (error) {
        log.error('Database periodic cleanup failed:', error)
      }
    }

    // 立即执行一次清理
    cleanup()

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(cleanup, intervalMs)

    log.info(
      `Periodic cleanup started: will run every ${intervalMs / (60 * 60 * 1000)} hours`,
    )
  }

  /**
   * 清理过期音频记录及对应的文件
   * @param retention 保留策略
   * @returns 删除的记录数
   */
  cleanupAudiosByRetention(retention: string): number {
    // 获取删除前的音频列表
    const audiosToDelete = this.getAudios()
    const deletedCount = this.deleteAudiosByRetention(retention)

    if (deletedCount > 0) {
      // 获取删除后的剩余音频
      const remainingAudios = this.getAudios()
      const remainingFilenames = new Set(remainingAudios.map((a) => a.filename))

      // 删除对应的音频文件
      const configDir = path.dirname(userConfigManager.getConfigPath())
      audiosToDelete.forEach((audio) => {
        if (!remainingFilenames.has(audio.filename)) {
          const audioPath = path.join(configDir, 'audios', audio.filename)
          if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath)
          }
        }
      })
    }

    return deletedCount
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
      const count = Math.floor(Math.random() * 5) + 80 // 8-12条
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
    // 停止周期性清理任务
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    if (this.db) {
      this.db.close()
      this.db = null
      this.initialized = false
    }
  }

  // ==================== Persona Operations ====================

  private normalizePersona(row: any): Persona {
    return {
      id: row.id,
      user_id: row.user_id ?? null,
      name: row.name,
      description: row.description ?? null,
      icon: row.icon,
      icon_svg: row.icon_svg ?? null,
      content: row.content,
      is_example: Boolean(row.is_example),
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
    }
  }

  /**
   * 获取所有 Persona
   */
  getPersonas(): Persona[] {
    const db = this.getDb()
    const stmt = db.prepare(
      'SELECT id, user_id, name, description, icon, icon_svg, content, is_example, created_at, updated_at FROM personas ORDER BY created_at DESC',
    )
    const rows = stmt.all() as any[]
    return rows.map((row) => this.normalizePersona(row))
  }

  /**
   * 根据 ID 获取 Persona
   */
  getPersonaById(id: number): Persona | null {
    const db = this.getDb()
    const stmt = db.prepare(
      'SELECT id, user_id, name, description, icon, icon_svg, content, is_example, created_at, updated_at FROM personas WHERE id = ?',
    )
    const row = stmt.get(id) as any
    return row ? this.normalizePersona(row) : null
  }

  /**
   * 保存 Persona 列表
   * - 不存在则插入
   * - 存在但 icon_svg 为空则更新
   * - 数据库中存在但新数据中不存在的记录将被删除
   */
  savePersonas(personas: Persona[]): boolean {
    const db = this.getDb()

    // 获取已存在的记录及其 icon_svg 状态
    const existingRecords = new Map(
      (
        db.prepare('SELECT id, icon_svg FROM personas').all() as {
          id: number
          icon_svg: string | null
        }[]
      ).map((row) => [row.id, row.icon_svg]),
    )

    // 收集新数据中的所有 ID
    const newPersonaIds = new Set(personas.map((p) => p.id))

    // 找出需要删除的 ID（数据库中有但新数据中没有）
    const idsToDelete = Array.from(existingRecords.keys()).filter(
      (id) => !newPersonaIds.has(id),
    )

    const insertStmt = db.prepare(
      'INSERT INTO personas (id, user_id, name, description, icon, icon_svg, content, is_example, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )

    const updateStmt = db.prepare(
      'UPDATE personas SET user_id = ?, name = ?, description = ?, icon = ?, icon_svg = ?, content = ?, is_example = ?, created_at = ?, updated_at = ? WHERE id = ?',
    )

    const deletePersonaStmt = db.prepare('DELETE FROM personas WHERE id = ?')

    const transaction = db.transaction(() => {
      // 删除多余的记录
      for (const id of idsToDelete) {
        deletePersonaStmt.run(id)
      }

      // 插入或更新新数据
      for (const persona of personas) {
        const existingIconSvg = existingRecords.get(persona.id)

        if (existingIconSvg === undefined) {
          // 不存在，插入
          insertStmt.run(
            persona.id,
            persona.user_id,
            persona.name,
            persona.description,
            persona.icon,
            persona.icon_svg ?? null,
            persona.content,
            persona.is_example ? 1 : 0,
            persona.created_at,
            persona.updated_at,
          )
        } else if (!existingIconSvg) {
          // 存在但 icon_svg 为空，更新
          updateStmt.run(
            persona.user_id,
            persona.name,
            persona.description,
            persona.icon,
            persona.icon_svg ?? null,
            persona.content,
            persona.is_example ? 1 : 0,
            persona.created_at,
            persona.updated_at,
            persona.id,
          )
        }
        // 存在且 icon_svg 不为空，跳过
      }
    })

    try {
      transaction()
      return true
    } catch (err) {
      console.error('保存 Persona 列表失败:', err)
      return false
    }
  }

  /**
   * 创建单个 Persona
   */
  createPersona(persona: Persona): boolean {
    const db = this.getDb()
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO personas (id, user_id, name, description, icon, icon_svg, content, is_example, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )

    try {
      stmt.run(
        persona.id,
        persona.user_id,
        persona.name,
        persona.description,
        persona.icon,
        persona.icon_svg ?? null,
        persona.content,
        persona.is_example ? 1 : 0,
        persona.created_at,
        persona.updated_at,
      )
      return true
    } catch (err) {
      console.error('创建 Persona 失败:', err)
      return false
    }
  }

  /**
   * 更新单个 Persona
   */
  updatePersona(persona: Persona): boolean {
    const db = this.getDb()
    const stmt = db.prepare(
      'UPDATE personas SET user_id = ?, name = ?, description = ?, icon = ?, icon_svg = ?, content = ?, is_example = ?, created_at = ?, updated_at = ? WHERE id = ?',
    )

    try {
      const result = stmt.run(
        persona.user_id,
        persona.name,
        persona.description,
        persona.icon,
        persona.icon_svg ?? null,
        persona.content,
        persona.is_example ? 1 : 0,
        persona.created_at,
        persona.updated_at,
        persona.id,
      )
      return result.changes > 0
    } catch (err) {
      console.error('更新 Persona 失败:', err)
      return false
    }
  }

  /**
   * 删除单个 Persona
   */
  deletePersona(id: number): boolean {
    const db = this.getDb()
    const stmt = db.prepare('DELETE FROM personas WHERE id = ?')

    try {
      const result = stmt.run(id)
      return result.changes > 0
    } catch (err) {
      console.error('删除 Persona 失败:', err)
      return false
    }
  }

  /**
   * 清空所有 Persona
   */
  clearAllPersonas(): number {
    const db = this.getDb()
    const stmt = db.prepare('DELETE FROM personas')
    const result = stmt.run()
    return result.changes
  }
}

export default new DatabaseService()

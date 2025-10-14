import * as net from 'net'
import * as fs from 'fs'
import { EventEmitter } from 'events'
import {
  ClientInfo,
  Message,
  MessageTypes,
  ServerResultOptions,
  UdsServiceOptions,
} from '../types/message'
import log from 'electron-log'

/**
 * UDS (Unix Domain Socket) 服务
 * 实现秒言 Electron 主进程与 Native 进程之间的 UDS 通信协议
 */
class UDSService extends EventEmitter {
  private readonly socketPath: string
  private server: net.Server | null = null
  private clients: Map<string, ClientInfo> = new Map()

  private isRunning = false

  constructor(options: UdsServiceOptions = {}) {
    super()
    this.socketPath = options.socketPath || '/tmp/com.ripplestars.miaoyan.uds.test'
  }

  async start(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.cleanupSocket()

        this.server = net.createServer((socket) => this.handleClientConnection(socket))
        this.server.on('error', (err) => this.emit('error', err))

        this.server.listen(this.socketPath, () => {
          this.isRunning = true
          log.info(`UDS Server start on socket: ${this.socketPath}`)
          this.emit('started', this.socketPath)
          resolve(this.socketPath)
        })
      } catch (err) {
        log.error('Failed to start UDS server:', err)
        reject(err)
      }
    })
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isRunning || !this.server) {
        resolve()
        return
      }

      this.clients.forEach((client) => {
        client.socket.end()
      })
      this.clients.clear()

      this.server.close(() => {
        this.isRunning = false
        this.server = null
        this.cleanupSocket()
        log.info('UDS Server stopped')
        this.emit('stopped')
        resolve()
      })
    })
  }

  private handleClientConnection(socket: net.Socket) {
    const clientId = `${socket.remoteAddress || 'unknown'}-${Date.now()}`
    const clientInfo: ClientInfo = {
      id: clientId,
      socket,
      connectedAt: new Date(),
      lastActivity: new Date(),
    }

    this.clients.set(clientId, clientInfo)
    log.info(`New UDS client connected: ${clientId}`)
    this.emit('clientConnected', clientInfo)

    socket.setEncoding('utf8')

    socket.on('data', (data) => {
      clientInfo.lastActivity = new Date()
      this.handleClientData(clientId, data)
    })

    socket.on('close', () => {
      this.clients.delete(clientId)
      this.emit('clientDisconnected', clientInfo)
    })

    socket.on('error', (err) => {
      this.clients.delete(clientId)
      this.emit('clientError', clientId, err)
    })
  }

  private handleClientData(clientId: string, data: any) {
    const lines = data
      .toString()
      .split('\n')
      .filter((line: string) => line.trim())

    lines.forEach((line: string) => {
      try {
        const message = JSON.parse(line.trim()) as Message
        this.handleMessageRecording(clientId, message)
      } catch (parseError) {
        log.error(`Failed to parse message from client ${clientId}:`, parseError)
        log.error('Raw data:', line)
      }
    })
  }

  /**
   * 验证消息格式
   */
  private validateMessage(message: any): message is Message {
    return (
      message &&
      typeof message === 'object' &&
      typeof message.type === 'string' &&
      typeof message.timestamp === 'number'
    )
  }

  /**
   * 处理录音相关消息
   */
  private handleMessageRecording(clientId: string, message: Message) {
    if (!this.validateMessage(message)) {
      return
    }

    const data = message.data || {}

    if (message.type !== MessageTypes.VOLUME_DATA) {
      console.log(`UDS: ${message.type}: - ${JSON.stringify(message)}`)
    }

    this.emit(message.type, { clientId, timestamp: message.timestamp, data }, message)
  }

  broadcast(message: Message) {
    const messageStr = JSON.stringify(message) + '\n'
    this.clients.forEach((client, _) => client.socket.write(messageStr))
  }

  /**
   * 发送消息给特定客户端
   */
  sendToClient(clientId: string, message: Message): boolean {
    const client = this.clients.get(clientId)
    if (!client) {
      log.warn(`Client ${clientId} not found`)
      return false
    }

    try {
      const messageStr = JSON.stringify(message) + '\n'
      client.socket.write(messageStr)
      return true
    } catch (error) {
      log.error(`Error sending message to client ${clientId}:`, error)
      this.clients.delete(clientId)
      return false
    }
  }

  sendServerResult(
    resultType: string,
    content: string,
    options: ServerResultOptions = {},
  ): Message {
    const message: Message = {
      type: MessageTypes.SERVER_RESULT,
      timestamp: Date.now(),
      data: {
        result_type: resultType,
        content,
        confidence: options.confidence,
        status: options.status || 'success',
        error_message: options.errorMessage || null,
      },
    }

    console.log(`Sending server result: ${resultType} - ${content}`)
    this.broadcast(message)
    return message
  }

  private cleanupSocket() {
    try {
      if (fs.existsSync(this.socketPath)) {
        fs.unlinkSync(this.socketPath)
        log.info(`Cleaned up socket file: ${this.socketPath}`)
      }
    } catch (err) {
      log.error(`Error cleaning up socket file: ${(err as Error).message}`)
    }
  }
}

export default new UDSService()

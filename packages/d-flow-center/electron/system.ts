import { app } from 'electron'
import os from 'node:os'
import { execSync } from 'node:child_process'
import log from 'electron-log'
import request from '../src/lib/request'

export type SystemInfo = {
  appVersion: string
  osVersion: string
  deviceModel: string | null
}

function getMacOsVersion(): string {
  if (process.platform !== 'darwin') return os.release()
  try {
    const output = execSync('sw_vers -productVersion', {
      encoding: 'utf8',
    })
    return output.trim()
  } catch {
    return os.release()
  }
}

function getMacModel(): string | null {
  if (process.platform !== 'darwin') return null
  try {
    const output = execSync('sysctl -n hw.model', {
      encoding: 'utf8',
    })
    return output.trim()
  } catch {
    return null
  }
}

export const getSystemInfo = async () => {
  return {
    appVersion: app.getVersion(),
    osVersion: getMacOsVersion(),
    deviceModel: getMacModel(),
  }
}

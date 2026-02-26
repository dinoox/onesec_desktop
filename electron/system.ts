import { app } from 'electron'
import os from 'node:os'
import { execSync } from 'node:child_process'

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

function getDeviceModel(): string | null {
  if (process.platform !== 'darwin') return null
  try {
    const model = execSync('sysctl -n hw.model', {
      encoding: 'utf8',
    }).trim()

    const arch = execSync('uname -m', {
      encoding: 'utf8',
    }).trim()

    const chipType = arch === 'arm64' ? 'Apple Silicon' : 'Intel'

    return `${model} (${chipType})`
  } catch {
    return null
  }
}

export const getSystemInfo = async () => {
  return {
    appVersion: app.getVersion(),
    osVersion: getMacOsVersion(),
    deviceModel: getDeviceModel(),
  }
}

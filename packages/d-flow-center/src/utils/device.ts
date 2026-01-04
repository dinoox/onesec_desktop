import { throttle } from '../../main/utils/throttle'
import IPCService from '@/services/ipc-service'
import { updateDeviceInfo } from '@/services/api/user-api'

// 同步设备信息
// 一天最多执行一次
export const throttledUpdateDeviceInfo = throttle(
  async () => {
    const info = await IPCService.getSystemInfo()
    await updateDeviceInfo(info)
  },
  24 * 60 * 60 * 1000,
)

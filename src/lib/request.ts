import queryString from 'query-string'
import authStore from '@/store/auth-store.ts'
import useStatusStore from '@/store/status-store.ts'
import { UserService } from '@/services/user-service.ts'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type Config = { cache: 'no-store' } | { cache: 'force-cache' }

interface Params {
  cache?: Config
  params?: Record<string, any>
  headers?: Record<string, any>
}

interface Props extends Params {
  url: string
  method: Method
}

let refreshingPromise: Promise<boolean> | null = null

async function tryRefreshToken(): Promise<boolean> {
  const { refreshToken } = authStore.getState()
  if (!refreshToken) return false
  try {
    const res = await fetch(
      import.meta.env.VITE_API_BASEURL + '/auth/refresh',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
    )
    const data = await res.json()
    if (data.code === 200 && data.result) {
      const newLoginData = {
        access_token: data.result.access_token,
        refresh_token: data.result.refresh_token,
        tokenExpirationTime: data.result.tokenExpirationTime ?? '',
      }
      await UserService.setPartialConfig({ login_data: newLoginData })
      authStore.setState({
        accessToken: newLoginData.access_token,
        refreshToken: newLoginData.refresh_token,
      })
      return true
    }
    return false
  } catch {
    return false
  }
}

async function handleAuthFailed() {
  const { setAuthTokenInvalid } = useStatusStore.getState().actions
  setAuthTokenInvalid(true)
  await UserService.claimAuthTokenFailed()
}

class Request {
  interceptorsRequest({ url, method, params, cache, headers = {} }: Props) {
    let queryParams = ''
    let requestPayload = ''
    const config: Config = cache || { cache: 'no-store' }
    Object.assign(headers, {
      Authorization: `Bearer ${authStore.getState().accessToken}`,
    })

    if (method === 'GET' || method === 'DELETE') {
      if (params) {
        queryParams = queryString.stringify(params)
        url = `${url}?${queryParams}`
      }
    } else {
      if (
        !['[object FormData]', '[object URLSearchParams]'].includes(
          Object.prototype.toString.call(params),
        )
      ) {
        Object.assign(headers, { 'Content-Type': 'application/json' })
        requestPayload = JSON.stringify(params)
      }
    }
    return {
      url,
      options: {
        method,
        headers,
        body: method !== 'GET' && method !== 'DELETE' ? requestPayload : undefined,
        ...config,
      },
    }
  }

  async interceptorsResponse<T>(res: Response): Promise<T> {
    const requestUrl = res.url
    if (res.ok) {
      return (await res.json()) as T
    } else {
      const text = await res.clone().text()
      try {
        return JSON.parse(text)
      } catch {
        return Promise.reject({ code: 500, message: text, url: requestUrl })
      }
    }
  }

  async httpFactory<T>({ url = '', params = {}, method }: Props): Promise<T> {
    const fullUrl = url.startsWith('http')
      ? url
      : import.meta.env.VITE_API_BASEURL + url
    const buildReq = () =>
      this.interceptorsRequest({
        url: fullUrl,
        method,
        params: params.params,
        cache: params.cache,
        headers: { ...params.headers },
      })

    let res = await fetch(buildReq().url, buildReq().options)

    if (res.status === 401) {
      if (!refreshingPromise) {
        refreshingPromise = tryRefreshToken().finally(
          () => (refreshingPromise = null),
        )
      }
      const refreshed = await refreshingPromise
      if (refreshed) {
        const retry = buildReq()
        res = await fetch(retry.url, retry.options)
        return this.interceptorsResponse<T>(res)
      }
      await handleAuthFailed()
    }

    return this.interceptorsResponse<T>(res)
  }

  async request<T>(
    method: Method,
    url: string,
    params?: Params,
  ): Promise<DataResponse<T>> {
    // 非 GET 请求自动添加签名
    if (method !== 'GET') {
      const requestParams = params?.params ?? {}
      params = {
        ...params,
        params: requestParams,
      }
    }
    return this.httpFactory<DataResponse<T>>({ url, params, method })
  }

  get<T>(url: string, params?: Params): Promise<DataResponse<T>> {
    return this.request('GET', url, params)
  }

  post<T>(url: string, params?: Params): Promise<DataResponse<T>> {
    return this.request('POST', url, params)
  }

  put<T>(url: string, params?: Params): Promise<DataResponse<T>> {
    return this.request('PUT', url, params)
  }

  delete<T>(url: string, params?: Params): Promise<DataResponse<T>> {
    return this.request('DELETE', url, params)
  }

  patch<T>(url: string, params?: Params): Promise<DataResponse<T>> {
    return this.request('PATCH', url, params)
  }
}

const request = new Request()

export interface DataResponse<T> {
  code: number
  error: string
  message: string
  result: T
}

export default request

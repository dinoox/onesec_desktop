import queryString from 'query-string'
import authStore from '@/store/auth-store.ts'
import useStatusStore from "@/store/status-store.ts";
import {UserService} from "@/services/user-service.ts";

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

class Request {
  /**
   * 请求拦截器
   */
  interceptorsRequest({ url, method, params, cache, headers = {} }: Props) {
    let queryParams = '' //url参数
    let requestPayload = '' //请求体数据
    const config: Config = cache || { cache: 'no-store' }
    Object.assign(headers, {
      Authorization: `Bearer ${authStore.getState().accessToken}`,
    })

    if (method === 'GET' || method === 'DELETE') {
      //fetch对GET请求等，不支持将参数传在body上，只能拼接url
      if (params) {
        queryParams = queryString.stringify(params)
        url = `${url}?${queryParams}`
      }
    } else {
      //非form-data传输JSON数据格式
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

  /**
   * 响应拦截器
   */
  async interceptorsResponse<T>(res: Response): Promise<T> {
    const requestUrl = res.url
    if (res.ok) {
      const data = await res.json()
      if (data.error_code === 'TOKEN_MISMATCH' || data.code === 401) {
        const { setAuthTokenInvalid } = useStatusStore.getState().actions
        setAuthTokenInvalid(true)
        await UserService.claimAuthTokenFailed()
        console.log('TOKEN_MISMATCH', data)
      }
      return data as T
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
    const req = this.interceptorsRequest({
      url: url.startsWith('http') ? url : import.meta.env.VITE_API_BASEURL + url,
      method,
      params: params.params,
      cache: params.cache,
      headers: params.headers,
    })
    let res = await fetch(req.url, req.options)
    // if (res.status === 401 && authStore.getState().refreshToken) {
    //   const resp = await refreshToken(authStore.getState().refreshToken!)
    //   if (!resp.success) {
    //     authStore.getState().actions.logout()
    //   } else {
    //     authStore.getState().actions.setAccessToken(resp.data.access_token)
    //     authStore.getState().actions.setRefreshToken(resp.data.refresh_token)
    //     const options = {
    //       ...req.options,
    //       headers: {
    //         ...req.options.headers,
    //         Authorization: `Bearer ${resp.data.access_token}`,
    //       },
    //     }
    //     res = await fetch(req.url, options)
    //   }
    // }
    return this.interceptorsResponse<T>(res)
  }

  async request<T>(
    method: Method,
    url: string,
    params?: Params,
  ): Promise<DataResponse<T>> {
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
  message: string
  success: boolean
  data: T
}

export interface PageData<T> {
  totalElements: number
  pageNum: number
  pageSize: number
  totalPage: number
  content: T[]
}

export default request

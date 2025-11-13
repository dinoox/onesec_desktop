export enum SystemFamily {
  Debian = 'debian',
  RedHat = 'red_hat',
}

export interface TerminalBinding {
  id: number
  bundle_id: string
  app_name: string
  endpoint_identifier: string
  linux_distro: SystemFamily
  linux_version: string
  hostname?: string
  bound_at: string
}

export interface TerminalBindingListResponse {
  items: TerminalBinding[]
  total: number
}

export interface BindTerminalParams {
  endpoint_identifier: string
  linux_distro: SystemFamily
  linux_version?: string
  bundle_id?: string
  app_name?: string
  hostname?: string
}

export interface UpdateTerminalParams {
  binding_id: number
  endpoint_identifier?: string
  linux_distro?: SystemFamily
  linux_version?: string
  bundle_id?: string
  app_name?: string
}

export interface DeleteTerminalParams {
  binding_id: number
}

export interface ListTerminalParams {
  endpoint_identifier?: string
}

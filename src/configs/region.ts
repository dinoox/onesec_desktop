const region = import.meta.env.VITE_REGION || 'cn'
export const isCN = region === 'cn'

export const regionConfig = {
  showGoogleLogin: !isCN,
  termsUrl: isCN
    ? 'https://sayso.cn/terms-of-service'
    : 'https://www.sayso.ai/terms-of-service',
  privacyUrl: isCN
    ? 'https://sayso.ai/privacy-policy'
    : 'https://www.sayso.ai/privacy-policy',
}

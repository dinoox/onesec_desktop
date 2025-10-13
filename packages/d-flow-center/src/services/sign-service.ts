import CryptoJS from 'crypto-js'

const SECRET_KEY = '1fp}fdSpYaj>7P;5b|HmTBF;OQmC'

export interface SignatureParams {
  [key: string]: any
}

export interface SignatureResult {
  sign: string
  time: string
}

export const generateSignature = async (
  params: SignatureParams,
): Promise<SignatureResult> => {
  try {
    const timestamp = Date.now()
    const sortedKeys = Object.keys(params).sort()

    const signString =
      sortedKeys.map((key) => `${key}=${params[key]}`).join('#') +
      `#time=${timestamp}#secret_key=${SECRET_KEY}`

    const sign = CryptoJS.MD5(signString).toString()

    console.log('sign', sign)
    console.log('signString', signString)
    return {
      sign,
      time: timestamp.toString(),
    }
  } catch (error) {
    console.error('Signature generation failed:', error)
    throw new Error('签名生成失败')
  }
}

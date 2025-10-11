// 测试 crypto 和 crypto-js 的 MD5 是否等同
import crypto from 'crypto'
import CryptoJS from 'crypto-js'

const testString = 'phone=13800138000#time=1234567890#secret_key=1fp}fdSpYaj>7P;5b|HmTBF;OQmC'

// Node.js crypto
const nodeCryptoResult = crypto.createHash('md5').update(testString).digest('hex')

// crypto-js
const cryptoJsResult = CryptoJS.MD5(testString).toString()

console.log('测试字符串:', testString)
console.log('\nNode.js crypto 结果:', nodeCryptoResult)
console.log('crypto-js 结果:    ', cryptoJsResult)
console.log('\n结果是否相同:', nodeCryptoResult === cryptoJsResult ? '✅ 是' : '❌ 否')


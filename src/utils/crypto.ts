import CryptoJS from 'crypto-js'

// 固定的加密密钥
const ENCRYPTION_KEY = 'ansAesEncryptEvaluationSecretKey'

/**
 * AES加密函数
 * @param data 要加密的数据
 * @param key 加密密钥（可选，默认使用固定密钥）
 * @returns 加密后的字符串
 */
export function aesEncrypt(data: any, key: string = ENCRYPTION_KEY): string {
  try {
    // 将数据转换为JSON字符串
    const jsonStr = JSON.stringify(data)

    // 创建16字节全0的IV
    const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000')

    // 将密钥转换为WordArray
    const keyWordArray = CryptoJS.enc.Utf8.parse(key)

    // 使用AES-256-CBC加密
    const encrypted = CryptoJS.AES.encrypt(jsonStr, keyWordArray, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    // 返回Base64编码的加密结果
    return encrypted.toString()
  }
  catch (error) {
    console.error('加密失败:', error)
    return ''
  }
}

/**
 * AES解密函数
 * @param encryptedData 加密的数据
 * @param key 解密密钥（可选，默认使用固定密钥）
 * @returns 解密后的数据
 */
export function aesDecrypt(encryptedData: string, key: string = ENCRYPTION_KEY): any {
  try {
    // 创建16字节全0的IV
    const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000')

    // 将密钥转换为WordArray
    const keyWordArray = CryptoJS.enc.Utf8.parse(key)

    // 使用AES-256-CBC解密
    const decrypted = CryptoJS.AES.decrypt(encryptedData, keyWordArray, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    // 转换为字符串并解析JSON
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decryptedStr)
  }
  catch (error) {
    console.error('解密失败:', error)
    return null
  }
}

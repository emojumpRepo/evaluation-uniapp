/**
 * 手机号脱敏
 * @param phone 手机号
 * @returns 脱敏后的手机号
 */
export function phoneDesensitization(phone: string) {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

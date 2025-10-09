import { z } from 'zod'

export const LoginFormSchema = z.object({
  phone: z.string().min(1, { message: '手机号为必填项' }),
  verification_code: z.string().min(1, { message: '验证码为必填项' }),
  invite_code: z.string().optional(),
})

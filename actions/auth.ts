'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上で入力してください"),
  name: z.string().optional(),
})

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string | null

  // バリデーション
  const result = registerSchema.safeParse({ email, password, name })
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email: result.data.email }
    })

    if (existingUser) {
      return { error: "このメールアドレスは既に使用されています" }
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(result.data.password, 10)

    // ユーザー作成
    await prisma.user.create({
      data: {
        email: result.data.email,
        password: hashedPassword,
        name: result.data.name || null,
      }
    })

    // 成功を返す（クライアント側でリダイレクト）
    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "アカウント作成に失敗しました" }
  }
}


'use server'

import { prisma } from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/get-server-session"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const tournamentSchema = z.object({
  name: z.string().min(1, "トーナメント名を入力してください").max(100, "トーナメント名は100文字以内で入力してください"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "有効な日時を入力してください"),
  buyIn: z.coerce.number().int().min(0, "バイイン金額は0以上で入力してください"),
})

export async function createTournament(formData: FormData) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return { error: "ログインが必要です", redirect: "/login" }
  }

  const name = formData.get("name") as string
  const date = formData.get("date") as string
  const buyIn = formData.get("buyIn") as string

  // バリデーション
  const result = tournamentSchema.safeParse({ name, date, buyIn })
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    await prisma.tournament.create({
      data: {
        userId: session.user.id,
        name: result.data.name,
        date: new Date(result.data.date),
        buyIn: result.data.buyIn,
      }
    })

    revalidatePath("/mypage")
    return { success: true }
  } catch (error) {
    console.error("Create tournament error:", error)
    return { error: "トーナメントの作成に失敗しました" }
  }
}

export async function updateTournament(id: string, formData: FormData) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return { error: "ログインが必要です", redirect: "/login" }
  }

  const name = formData.get("name") as string
  const date = formData.get("date") as string
  const buyIn = formData.get("buyIn") as string

  // バリデーション
  const result = tournamentSchema.safeParse({ name, date, buyIn })
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    // 所有権チェック
    const tournament = await prisma.tournament.findUnique({
      where: { id }
    })

    if (!tournament) {
      return { error: "トーナメントが見つかりません" }
    }

    if (tournament.userId !== session.user.id) {
      return { error: "このトーナメントを編集する権限がありません" }
    }

    await prisma.tournament.update({
      where: { id },
      data: {
        name: result.data.name,
        date: new Date(result.data.date),
        buyIn: result.data.buyIn,
      }
    })

    revalidatePath("/mypage")
    revalidatePath(`/mypage/tournaments/${id}`)
    return { success: true, redirect: `/mypage/tournaments/${id}` }
  } catch (error) {
    console.error("Update tournament error:", error)
    return { error: "トーナメントの更新に失敗しました" }
  }
}

export async function deleteTournament(id: string) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return { error: "ログインが必要です", redirect: "/login" }
  }

  try {
    // 所有権チェック
    const tournament = await prisma.tournament.findUnique({
      where: { id }
    })

    if (!tournament) {
      return { error: "トーナメントが見つかりません" }
    }

    if (tournament.userId !== session.user.id) {
      return { error: "このトーナメントを削除する権限がありません" }
    }

    await prisma.tournament.delete({
      where: { id }
    })

    revalidatePath("/mypage")
    return { success: true, redirect: "/mypage" }
  } catch (error) {
    console.error("Delete tournament error:", error)
    return { error: "トーナメントの削除に失敗しました" }
  }
}


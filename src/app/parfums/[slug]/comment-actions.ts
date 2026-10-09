"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addComment(reviewId: string, text: string, perfumeSlug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non connecté");

  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 1000) throw new Error("Commentaire invalide");

  await prisma.comment.create({
    data: { userId: session.user.id, reviewId, text: trimmed },
  });

  revalidatePath(`/parfums/${perfumeSlug}`);
}

export async function deleteComment(commentId: string, perfumeSlug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non connecté");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });
  if (!comment || comment.userId !== session.user.id) throw new Error("Non autorisé");

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/parfums/${perfumeSlug}`);
}

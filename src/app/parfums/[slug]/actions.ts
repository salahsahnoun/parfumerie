"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CollectionStatus, Season, Occasion } from "@/generated/prisma/client";

export async function upsertReview(
  perfumeSlug: string,
  data: {
    rating: number;
    text?: string;
    longevity?: number;
    sillage?: number;
    valueForMoney?: number;
    seasons?: Season[];
    occasions?: Occasion[];
    blindBuy?: boolean;
  }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/connexion");

  const perfume = await prisma.perfume.findUnique({
    where: { slug: perfumeSlug },
    select: { id: true },
  });
  if (!perfume) throw new Error("Parfum introuvable");

  await prisma.review.upsert({
    where: { userId_perfumeId: { userId: session.user.id, perfumeId: perfume.id } },
    create: {
      userId: session.user.id,
      perfumeId: perfume.id,
      rating: data.rating,
      text: data.text?.trim() || null,
      longevity: data.longevity ?? null,
      sillage: data.sillage ?? null,
      valueForMoney: data.valueForMoney ?? null,
      seasons: data.seasons ?? [],
      occasions: data.occasions ?? [],
      blindBuy: data.blindBuy ?? null,
    },
    update: {
      rating: data.rating,
      text: data.text?.trim() || null,
      longevity: data.longevity ?? null,
      sillage: data.sillage ?? null,
      valueForMoney: data.valueForMoney ?? null,
      seasons: data.seasons ?? [],
      occasions: data.occasions ?? [],
      blindBuy: data.blindBuy ?? null,
    },
  });

  revalidatePath(`/parfums/${perfumeSlug}`);
}

export async function upsertCollection(perfumeId: string, status: CollectionStatus) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/connexion");

  await prisma.collection.upsert({
    where: { userId_perfumeId: { userId: session.user.id, perfumeId } },
    create: { userId: session.user.id, perfumeId, status },
    update: { status },
  });

  revalidatePath("/collection");
}

export async function removeFromCollection(perfumeId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/connexion");

  await prisma.collection.deleteMany({
    where: { userId: session.user.id, perfumeId },
  });

  revalidatePath("/collection");
}

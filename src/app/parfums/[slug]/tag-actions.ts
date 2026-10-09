"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slugify";

export async function toggleTag(perfumeId: string, tagName: string, perfumeSlug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non connecté");

  const slug = slugify(tagName);

  const tag = await prisma.tag.upsert({
    where: { slug },
    update: {},
    create: { name: tagName, slug },
  });

  const existing = await prisma.tagOnPerfume.findUnique({
    where: { tagId_perfumeId: { tagId: tag.id, perfumeId } },
  });

  if (existing) {
    await prisma.tagOnPerfume.delete({
      where: { tagId_perfumeId: { tagId: tag.id, perfumeId } },
    });
  } else {
    await prisma.tagOnPerfume.create({
      data: { tagId: tag.id, perfumeId },
    });
  }

  revalidatePath(`/parfums/${perfumeSlug}`);
}

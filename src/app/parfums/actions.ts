"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slugify";
import type { Gender } from "@/generated/prisma/client";

export async function createPerfume(data: {
  name: string;
  houseName: string;
  year?: number;
  concentration?: string;
  gender?: Gender;
  description?: string;
  imageUrl?: string;
  accords?: string[];
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/connexion");

  if (!data.name.trim() || !data.houseName.trim()) {
    throw new Error("Nom et maison sont requis.");
  }

  // Trouver ou créer la maison
  let house = await prisma.house.findFirst({
    where: { name: { equals: data.houseName.trim(), mode: "insensitive" } },
  });
  if (!house) {
    const houseSlug = await uniqueSlug(data.houseName, (s) =>
      prisma.house.findUnique({ where: { slug: s } }).then(Boolean)
    );
    house = await prisma.house.create({
      data: { name: data.houseName.trim(), slug: houseSlug },
    });
  }

  const slug = await uniqueSlug(data.name, (s) =>
    prisma.perfume.findUnique({ where: { slug: s } }).then(Boolean)
  );

  const perfume = await prisma.perfume.create({
    data: {
      name: data.name.trim(),
      slug,
      houseId: house.id,
      year: data.year ?? null,
      concentration: data.concentration?.trim() || null,
      gender: data.gender ?? "UNISEX",
      description: data.description?.trim() || null,
      imageUrl: data.imageUrl?.trim() || null,
    },
  });

  // Accords
  if (data.accords?.length) {
    for (const name of data.accords) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      let accord = await prisma.accord.findFirst({
        where: { name: { equals: trimmed, mode: "insensitive" } },
      });
      if (!accord) {
        const accordSlug = await uniqueSlug(trimmed, (s) =>
          prisma.accord.findUnique({ where: { slug: s } }).then(Boolean)
        );
        accord = await prisma.accord.create({ data: { name: trimmed, slug: accordSlug } });
      }
      await prisma.accordOnPerfume.create({
        data: { accordId: accord.id, perfumeId: perfume.id, strength: 50 },
      });
    }
  }

  revalidatePath("/parfums");
  redirect(`/parfums/${slug}`);
}

export async function updatePerfumeInfo(
  perfumeId: string,
  data: {
    description?: string;
    imageUrl?: string;
    year?: number | null;
    concentration?: string;
    gender?: Gender;
  }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/connexion");

  const perfume = await prisma.perfume.update({
    where: { id: perfumeId },
    data: {
      description: data.description?.trim() || null,
      imageUrl: data.imageUrl?.trim() || null,
      year: data.year ?? null,
      concentration: data.concentration?.trim() || null,
      gender: data.gender,
    },
    select: { slug: true },
  });

  revalidatePath(`/parfums/${perfume.slug}`);
}

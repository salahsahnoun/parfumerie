"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createList(data: {
  title: string;
  description?: string;
  isPublic?: boolean;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/connexion");

  if (!data.title.trim()) throw new Error("Le titre est requis.");

  const list = await prisma.list.create({
    data: {
      userId: session.user.id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      isPublic: data.isPublic ?? true,
    },
  });

  revalidatePath("/listes");
  redirect(`/listes/${list.id}`);
}

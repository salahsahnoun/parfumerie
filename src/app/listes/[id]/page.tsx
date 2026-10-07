import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PerfumeGrid } from "@/components/parfum/PerfumeGrid";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import type { PerfumeCardData } from "@/components/parfum/PerfumeCard";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const liste = await prisma.list.findUnique({
    where: { id },
    select: { title: true },
  });
  if (!liste) return { title: "Liste introuvable" };
  return { title: liste.title };
}

export default async function ListePage({ params }: Props) {
  const { id } = await params;

  const liste = await prisma.list.findUnique({
    where: { id },
    include: {
      user: { select: { username: true } },
      items: {
        orderBy: { order: "asc" },
        include: {
          perfume: {
            include: {
              house: { select: { name: true } },
              accords: { include: { accord: { select: { name: true } } }, orderBy: { strength: "desc" } },
              reviews: { select: { rating: true } },
            },
          },
        },
      },
    },
  });

  if (!liste || !liste.isPublic) notFound();

  const parfums: PerfumeCardData[] = liste.items.map(({ perfume: p }) => {
    const ratings = p.reviews.map((r) => r.rating);
    return {
      slug: p.slug,
      name: p.name,
      house: p.house.name,
      imageUrl: p.imageUrl ?? undefined,
      year: p.year ?? undefined,
      rating: ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : undefined,
      reviewCount: ratings.length || undefined,
      accords: p.accords.map((a) => a.accord.name),
    };
  });

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{liste.title}</h1>
          <Badge variant="outline">Publique</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Créée par{" "}
          <Link href={`/profil/${liste.user.username}`} className="underline hover:text-foreground">
            @{liste.user.username}
          </Link>
          {" · "}
          {liste.items.length} parfum{liste.items.length !== 1 ? "s" : ""}
        </p>
        {liste.description && (
          <p className="text-sm max-w-prose">{liste.description}</p>
        )}
      </div>

      <Separator />

      <PerfumeGrid perfumes={parfums} />
    </div>
  );
}

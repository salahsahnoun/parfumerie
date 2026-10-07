import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerfumeGrid } from "@/components/parfum/PerfumeGrid";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PerfumeCardData } from "@/components/parfum/PerfumeCard";
import { CollectionStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Ma collection",
};

function toPerfumeCard(p: {
  slug: string;
  name: string;
  imageUrl: string | null;
  year: number | null;
  house: { name: string };
  accords: { accord: { name: string } }[];
  reviews: { rating: number }[];
}): PerfumeCardData {
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
}

const STATUS_LABELS: Record<CollectionStatus, string> = {
  OWNED: "Possédés",
  TRIED: "Essayés",
  WISHLIST: "Wishlist",
  DECANT_WANTED: "Décants voulus",
};

const STATUS_TABS: CollectionStatus[] = ["OWNED", "TRIED", "WISHLIST", "DECANT_WANTED"];
const TAB_VALUES: Record<CollectionStatus, string> = {
  OWNED: "owned",
  TRIED: "tried",
  WISHLIST: "wishlist",
  DECANT_WANTED: "decant",
};

export default async function CollectionPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-10 space-y-4">
        <h1 className="text-3xl font-bold">Ma collection</h1>
        <p className="text-muted-foreground">
          Connectez-vous pour accéder à votre collection.
        </p>
        <Link href="/connexion" className={cn(buttonVariants())}>
          Se connecter
        </Link>
      </div>
    );
  }

  const collection = await prisma.collection.findMany({
    where: { userId: session.user.id },
    include: {
      perfume: {
        include: {
          house: { select: { name: true } },
          accords: { include: { accord: { select: { name: true } } }, orderBy: { strength: "desc" } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const byStatus = Object.fromEntries(
    STATUS_TABS.map((status) => [
      status,
      collection.filter((c) => c.status === status).map((c) => toPerfumeCard(c.perfume)),
    ])
  ) as Record<CollectionStatus, PerfumeCardData[]>;

  const total = collection.length;

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Ma collection</h1>
        <p className="text-muted-foreground">
          {total} parfum{total !== 1 ? "s" : ""} · Gérez vos parfums possédés, essayés et en liste d&apos;envies
        </p>
      </div>

      <Tabs defaultValue="owned">
        <TabsList>
          {STATUS_TABS.map((status) => (
            <TabsTrigger key={status} value={TAB_VALUES[status]}>
              {STATUS_LABELS[status]} ({byStatus[status].length})
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((status) => (
          <TabsContent key={status} value={TAB_VALUES[status]} className="pt-6">
            {byStatus[status].length > 0 ? (
              <PerfumeGrid perfumes={byStatus[status]} />
            ) : (
              <p className="text-muted-foreground text-sm">
                Aucun parfum dans cette catégorie.
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

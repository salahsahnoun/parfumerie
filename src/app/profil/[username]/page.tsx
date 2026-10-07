import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PerfumeGrid } from "@/components/parfum/PerfumeGrid";
import { prisma } from "@/lib/prisma";
import type { PerfumeCardData } from "@/components/parfum/PerfumeCard";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true },
  });
  if (!user) return { title: "Profil introuvable" };
  return { title: `@${username}` };
}

export default async function ProfilPage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: { reviews: true, lists: true, followers: true, following: true },
      },
    },
  });

  if (!user) notFound();

  const [collection, recentReviews, lists] = await Promise.all([
    prisma.collection.findMany({
      where: { userId: user.id },
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
    }),
    prisma.review.findMany({
      where: { userId: user.id },
      include: {
        perfume: {
          include: {
            house: { select: { name: true } },
            accords: { include: { accord: { select: { name: true } } }, orderBy: { strength: "desc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.list.findMany({
      where: { userId: user.id, isPublic: true },
      include: { _count: { select: { items: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const accordCounts: Record<string, number> = {};
  for (const r of recentReviews) {
    for (const a of r.perfume.accords) {
      accordCounts[a.accord.name] = (accordCounts[a.accord.name] ?? 0) + 1;
    }
  }
  const topAccords = Object.entries(accordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name]) => name);

  const collectionPerfumes: PerfumeCardData[] = collection.map(({ perfume: p }) => {
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
      <div className="flex items-start gap-6">
        <Avatar className="h-24 w-24 text-2xl">
          <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">@{username}</h1>
          {user.bio ? (
            <p className="text-muted-foreground text-sm max-w-prose">{user.bio}</p>
          ) : null}
          <div className="flex gap-4 text-sm">
            <span><strong>{user._count.reviews}</strong> note{user._count.reviews !== 1 ? "s" : ""}</span>
            <span><strong>{user._count.lists}</strong> liste{user._count.lists !== 1 ? "s" : ""}</span>
            <span><strong>{user._count.followers}</strong> abonné{user._count.followers !== 1 ? "s" : ""}</span>
            <span><strong>{user._count.following}</strong> abonnement{user._count.following !== 1 ? "s" : ""}</span>
          </div>
          {topAccords.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              <span className="text-xs text-muted-foreground">Nez :</span>
              {topAccords.map((name) => (
                <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="collection">
        <TabsList>
          <TabsTrigger value="collection">Collection ({collection.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes récentes ({recentReviews.length})</TabsTrigger>
          <TabsTrigger value="listes">Listes ({lists.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="pt-6">
          {collectionPerfumes.length > 0 ? (
            <PerfumeGrid perfumes={collectionPerfumes} />
          ) : (
            <p className="text-muted-foreground text-sm">Aucun parfum dans la collection.</p>
          )}
        </TabsContent>

        <TabsContent value="notes" className="pt-6">
          {recentReviews.length > 0 ? (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/parfums/${review.perfume.slug}`} className="hover:underline">
                      <span className="font-semibold">{review.perfume.name}</span>
                      <span className="text-muted-foreground text-sm ml-2">{review.perfume.house.name}</span>
                    </Link>
                    <span className="text-sm font-semibold">{review.rating}/5</span>
                  </div>
                  {review.text && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{review.text}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucune note pour l&apos;instant.</p>
          )}
        </TabsContent>

        <TabsContent value="listes" className="pt-6">
          {lists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lists.map((list) => (
                <Link key={list.id} href={`/listes/${list.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-base">{list.title}</CardTitle>
                      <CardDescription>
                        {list._count.items} parfum{list._count.items !== 1 ? "s" : ""}
                        {list.description ? ` · ${list.description}` : ""}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucune liste pour l&apos;instant.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

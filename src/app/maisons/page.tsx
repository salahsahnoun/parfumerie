import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Maisons de parfum",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function MaisonsPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const maisons = await prisma.house.findMany({
    where: q
      ? { name: { contains: q, mode: "insensitive" } }
      : undefined,
    include: {
      _count: { select: { perfumes: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Maisons</h1>
        <p className="text-muted-foreground">
          {maisons.length} maison{maisons.length !== 1 ? "s" : ""} dans le catalogue
        </p>
      </div>

      <form method="GET">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Rechercher une maison..."
          className="max-w-lg"
        />
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {maisons.map((maison) => (
          <Link key={maison.id} href={`/maisons/${maison.slug}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground mb-2">
                  {maison.name[0]}
                </div>
                <CardTitle className="text-base">{maison.name}</CardTitle>
                <CardDescription>
                  {maison.country && `${maison.country} · `}
                  {maison._count.perfumes} parfum{maison._count.perfumes !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

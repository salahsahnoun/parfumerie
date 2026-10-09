import type { Metadata } from "next";
import { getParfumeurs } from "@/lib/cache";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Parfumeurs",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function ParfumeursPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const parfumeurs = await getParfumeurs(q);

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Parfumeurs</h1>
        <p className="text-muted-foreground">
          {parfumeurs.length} parfumeur{parfumeurs.length !== 1 ? "s" : ""} dans le catalogue
        </p>
      </div>

      <form method="GET">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Rechercher un parfumeur..."
          className="max-w-lg"
        />
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {parfumeurs.map((parfumeur) => (
          <Link key={parfumeur.id} href={`/parfumeurs/${parfumeur.slug}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground mb-2">
                  {parfumeur.name[0]}
                </div>
                <CardTitle className="text-base">{parfumeur.name}</CardTitle>
                <CardDescription>
                  {parfumeur._count.perfumes} création{parfumeur._count.perfumes !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

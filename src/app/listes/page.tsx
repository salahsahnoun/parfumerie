import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateListButton } from "./CreateListForm";

export const metadata: Metadata = {
  title: "Mes listes",
};

export default async function ListesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-10 space-y-4">
        <h1 className="text-3xl font-bold">Mes listes</h1>
        <p className="text-muted-foreground">Connectez-vous pour accéder à vos listes.</p>
        <Link href="/connexion" className={cn(buttonVariants())}>
          Se connecter
        </Link>
      </div>
    );
  }

  const listes = await prisma.list.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Mes listes</h1>
          <p className="text-muted-foreground">
            {listes.length} liste{listes.length !== 1 ? "s" : ""} · Organisez vos parfums en listes thématiques
          </p>
        </div>
        <CreateListButton />
      </div>

      {listes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listes.map((liste) => (
            <Link key={liste.id} href={`/listes/${liste.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{liste.title}</CardTitle>
                    <Badge variant={liste.isPublic ? "secondary" : "outline"} className="shrink-0 text-xs">
                      {liste.isPublic ? "Publique" : "Privée"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {liste._count.items} parfum{liste._count.items !== 1 ? "s" : ""}
                    {liste.description ? ` · ${liste.description}` : ""}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Aucune liste pour l&apos;instant.</p>
      )}
    </div>
  );
}

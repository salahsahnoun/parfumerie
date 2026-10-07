import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PerfumeGrid } from "@/components/parfum/PerfumeGrid";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/parfum/StarRating";
import { cn } from "@/lib/utils";
import type { PerfumeCardData } from "@/components/parfum/PerfumeCard";

export default async function HomePage() {
  const [rawPerfumes, recentReviews] = await Promise.all([
    prisma.perfume.findMany({
      take: 14,
      orderBy: { createdAt: "desc" },
      include: {
        house: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.review.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true } },
        perfume: {
          select: { name: true, slug: true, imageUrl: true, house: { select: { name: true } } },
        },
      },
    }),
  ]);

  const parfums: PerfumeCardData[] = rawPerfumes.map((p) => {
    const ratings = p.reviews.map((r) => r.rating);
    return {
      slug: p.slug,
      name: p.name,
      house: p.house.name,
      imageUrl: p.imageUrl ?? undefined,
      year: p.year ?? undefined,
      rating: ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : undefined,
      reviewCount: ratings.length || undefined,
    };
  });

  return (
    <div>
      {/* Hero — Letterboxd style */}
      <section className="border-b border-border/40 bg-gradient-to-b from-card/60 to-background">
        <div className="container mx-auto px-4 py-16 text-center space-y-5">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Notez et partagez{" "}
            <span className="lb-green">les parfums</span>
            <br />
            que vous aimez.
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Forum communautaire pour passionnés — ajoutez, notez, reviewez et
            construisez votre collection olfactive.
          </p>
          <div className="flex gap-3 justify-center flex-wrap pt-2">
            <Link href="/inscription" className={cn(buttonVariants({ size: "default" }))}>
              Commencer gratuitement
            </Link>
            <Link href="/parfums" className={cn(buttonVariants({ size: "default", variant: "outline" }))}>
              Parcourir le catalogue
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 space-y-12">
        {/* Parfums récemment ajoutés */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Récemment ajoutés
            </h2>
            <Link
              href="/parfums"
              className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              Voir tout →
            </Link>
          </div>
          <PerfumeGrid perfumes={parfums} />
        </section>

        {/* Activité récente */}
        {recentReviews.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Activité récente
            </h2>
            <div className="space-y-px">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-start gap-3 px-3 py-3 rounded-md hover:bg-card/60 transition-colors"
                >
                  <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                      {review.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap text-sm">
                      <Link
                        href={`/profil/${review.user.username}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {review.user.username}
                      </Link>
                      <span className="text-muted-foreground text-xs">a noté</span>
                      <Link
                        href={`/parfums/${review.perfume.slug}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {review.perfume.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        — {review.perfume.house.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StarRating rating={review.rating} size="sm" />
                      {review.text && (
                        <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
                          {review.text}
                        </p>
                      )}
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">
                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA bas de page */}
        <section className="border border-border/40 rounded-lg p-8 text-center space-y-4 bg-card/30">
          <p className="text-lg font-semibold">
            Le catalogue est construit par la communauté.
          </p>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Vous ne trouvez pas un parfum ? Ajoutez-le vous-même. Toute la base de données
            est ouverte aux contributions.
          </p>
          <Link
            href="/parfums/nouveau"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            + Ajouter un parfum
          </Link>
        </section>
      </div>
    </div>
  );
}

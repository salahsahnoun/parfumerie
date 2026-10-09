import Link from "next/link";
import { getHomepageData } from "@/lib/cache";
import { PerfumeGrid } from "@/components/parfum/PerfumeGrid";
import { buttonVariants } from "@/components/ui/button";
import { StarRating } from "@/components/parfum/StarRating";
import { cn } from "@/lib/utils";
import type { PerfumeCardData } from "@/components/parfum/PerfumeCard";

export const revalidate = 60;

export default async function HomePage() {
  const [rawPerfumes, recentReviews] = await getHomepageData();

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
      <section className="border-b border-border/30 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4 py-20 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Votre journal<br />
            <span className="lb-green">olfactif</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-base leading-relaxed">
            Notez les parfums que vous portez, découvrez ceux de la communauté, construisez votre collection.
          </p>
          <div className="flex gap-3 justify-center flex-wrap pt-2">
            <Link href="/inscription" className={cn(buttonVariants())}>
              Commencer gratuitement
            </Link>
            <Link href="/parfums" className={cn(buttonVariants({ variant: "outline" }))}>
              Parcourir le catalogue
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-14">
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="lb-section-title">Récemment ajoutés</p>
            <Link href="/parfums" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Voir tout →
            </Link>
          </div>
          <PerfumeGrid perfumes={parfums} />
        </section>

        {recentReviews.length > 0 && (
          <section className="space-y-4">
            <p className="lb-section-title">Activité récente</p>
            <div className="space-y-0">
              {recentReviews.map((review) => (
                <div key={review.id} className="flex items-start gap-3 py-3 lb-divider">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0 mt-0.5">
                    {review.user.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap text-sm">
                      <Link href={`/profil/${review.user.username}`} className="font-semibold hover:text-primary transition-colors">
                        {review.user.username}
                      </Link>
                      <span className="text-muted-foreground text-xs">a noté</span>
                      <Link href={`/parfums/${review.perfume.slug}`} className="font-medium hover:text-primary transition-colors">
                        {review.perfume.name}
                      </Link>
                      <span className="text-xs text-muted-foreground/70">— {review.perfume.house.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <StarRating rating={review.rating} size="sm" />
                      {review.text && (
                        <p className="text-xs text-muted-foreground line-clamp-1 flex-1">{review.text}</p>
                      )}
                      <span className="text-[10px] text-muted-foreground/50 shrink-0">
                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

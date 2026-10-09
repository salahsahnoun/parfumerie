import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getPerfumePage } from "@/lib/cache";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/parfum/StarRating";
import { ReviewForm } from "@/components/parfum/ReviewForm";
import { AddToCollectionButton } from "@/components/parfum/AddToCollectionButton";
import { CommentSection } from "@/components/parfum/CommentSection";
import { TagVote } from "@/components/parfum/TagVote";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const perfume = await prisma.perfume.findUnique({
    where: { slug },
    select: { name: true, house: { select: { name: true } } },
  });
  if (!perfume) return { title: "Parfum introuvable" };
  return { title: `${perfume.name} — ${perfume.house.name}` };
}

function avg(values: (number | null | undefined)[]) {
  const clean = values.filter((v): v is number => v != null);
  return clean.length ? clean.reduce((s, v) => s + v, 0) / clean.length : null;
}

function StatBar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  const pct = (value / 5) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value.toFixed(1)}<span className="text-muted-foreground">/5</span></span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const GENDER_LABEL: Record<string, string> = {
  MASCULINE: "Homme", FEMININE: "Femme", UNISEX: "Unisexe",
};
const SEASON_LABEL: Record<string, string> = {
  SPRING: "Printemps", SUMMER: "Été", AUTUMN: "Automne", WINTER: "Hiver",
};
const OCCASION_LABEL: Record<string, string> = {
  OFFICE: "Bureau", EVENING: "Soirée", SPORT: "Sport", DATE: "Date", CASUAL: "Quotidien",
};

export default async function PerfumePage({ params }: Props) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const isAuthenticated = !!session;

  const perfume = await getPerfumePage(slug);
  if (!perfume) notFound();

  const [userCollection, userReview] = session
    ? await Promise.all([
        prisma.collection.findUnique({
          where: { userId_perfumeId: { userId: session.user.id, perfumeId: perfume.id } },
          select: { status: true },
        }),
        prisma.review.findUnique({
          where: { userId_perfumeId: { userId: session.user.id, perfumeId: perfume.id } },
          select: { rating: true },
        }),
      ])
    : [null, null];

  const currentUsername = (session?.user as { username?: string } | undefined)?.username;

  const tagCounts: Record<string, number> = {};
  for (const t of perfume.tags) {
    tagCounts[t.tag.name] = (tagCounts[t.tag.name] ?? 0) + 1;
  }
  const myTags = session
    ? perfume.tags.filter((t) => t.userId === session.user.id).map((t) => t.tag.name)
    : [];

  const topNotes   = perfume.notes.filter((n) => n.position === "TOP");
  const heartNotes = perfume.notes.filter((n) => n.position === "HEART");
  const baseNotes  = perfume.notes.filter((n) => n.position === "BASE");

  const ratings      = perfume.reviews.map((r) => r.rating);
  const avgRating    = avg(ratings);
  const avgLongevity = avg(perfume.reviews.map((r) => r.longevity));
  const avgSillage   = avg(perfume.reviews.map((r) => r.sillage));
  const avgValue     = avg(perfume.reviews.map((r) => r.valueForMoney));
  const blindBuyYes  = perfume.reviews.filter((r) => r.blindBuy === true).length;
  const blindBuyTotal = perfume.reviews.filter((r) => r.blindBuy !== null).length;

  const seasonCounts: Record<string, number> = {};
  const occasionCounts: Record<string, number> = {};
  for (const review of perfume.reviews) {
    for (const s of review.seasons) seasonCounts[s] = (seasonCounts[s] ?? 0) + 1;
    for (const o of review.occasions) occasionCounts[o] = (occasionCounts[o] ?? 0) + 1;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">

        {/* ── Colonne gauche : image + actions ── */}
        <div className="w-full md:w-56 lg:w-64 shrink-0 space-y-4">
          <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-muted">
            {perfume.imageUrl ? (
              <Image
                src={perfume.imageUrl}
                alt={`${perfume.name} — ${perfume.house.name}`}
                fill
                sizes="(max-width: 768px) 80vw, 256px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-card select-none gap-3">
                <span className="text-6xl font-bold text-muted-foreground/25">{perfume.name[0]}</span>
                <span className="text-xs text-muted-foreground/40 uppercase tracking-widest text-center px-4">{perfume.house.name}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <ReviewForm
              perfumeSlug={slug}
              isAuthenticated={isAuthenticated}
              existingRating={userReview?.rating}
            />
            <AddToCollectionButton
              perfumeId={perfume.id}
              isAuthenticated={isAuthenticated}
              currentStatus={userCollection?.status ?? null}
            />
          </div>

          {/* Maison & parfumeurs */}
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <p className="lb-section-title">Maison</p>
              <Link href={`/maisons/${perfume.house.slug}`} className="text-sm font-medium hover:text-primary transition-colors">
                {perfume.house.name}
              </Link>
              {perfume.house.country && (
                <p className="text-xs text-muted-foreground">{perfume.house.country}</p>
              )}
            </div>
            {perfume.perfumers.length > 0 && (
              <div className="space-y-1">
                <p className="lb-section-title">Parfumeur{perfume.perfumers.length > 1 ? "s" : ""}</p>
                {perfume.perfumers.map(({ perfumer }) => (
                  <Link
                    key={perfumer.id}
                    href={`/parfumeurs/${perfumer.slug}`}
                    className="block text-sm hover:text-primary transition-colors"
                  >
                    {perfumer.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Colonne droite : contenu ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* En-tête */}
          <div className="space-y-3">
            <Link href={`/maisons/${perfume.house.slug}`} className="lb-section-title hover:text-primary transition-colors">
              {perfume.house.name}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{perfume.name}</h1>

            <div className="flex items-center gap-3 flex-wrap">
              {avgRating !== null ? (
                <>
                  <StarRating rating={avgRating} size="lg" />
                  <span className="text-muted-foreground text-sm">
                    {avgRating.toFixed(2)} · {perfume.reviews.length} avis
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">Pas encore noté</span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              {perfume.concentration && <Badge variant="default" className="text-xs">{perfume.concentration}</Badge>}
              {perfume.year && <Badge variant="outline" className="text-xs">{perfume.year}</Badge>}
              <Badge variant="outline" className="text-xs">{GENDER_LABEL[perfume.gender]}</Badge>
              {perfume.accords.slice(0, 4).map(({ accord }) => (
                <Badge key={accord.id} variant="secondary" className="text-xs">{accord.name}</Badge>
              ))}
            </div>
          </div>

          {perfume.description && (
            <p className="text-muted-foreground leading-relaxed text-sm max-w-2xl">{perfume.description}</p>
          )}

          {/* Stats rapides */}
          {(avgLongevity !== null || avgSillage !== null || avgValue !== null) && (
            <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-card border border-border/40 max-w-md">
              {avgLongevity !== null && <div className="text-center">
                <p className="text-lg font-bold">{avgLongevity.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Longévité</p>
              </div>}
              {avgSillage !== null && <div className="text-center">
                <p className="text-lg font-bold">{avgSillage.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Sillage</p>
              </div>}
              {avgValue !== null && <div className="text-center">
                <p className="text-lg font-bold">{avgValue.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Rapport Q/P</p>
              </div>}
            </div>
          )}

          <Separator className="border-border/30" />

          {/* Pyramide olfactive */}
          {(topNotes.length > 0 || heartNotes.length > 0 || baseNotes.length > 0) && (
            <div className="space-y-3">
              <p className="lb-section-title">Pyramide olfactive</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Tête", notes: topNotes },
                  { label: "Cœur", notes: heartNotes },
                  { label: "Fond", notes: baseNotes },
                ].map(({ label, notes }) => (
                  <div key={label} className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <ul className="space-y-1">
                      {notes.length > 0
                        ? notes.map(({ note }) => (
                            <li key={note.id} className="text-xs flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                              {note.name}
                            </li>
                          ))
                        : <li className="text-xs text-muted-foreground">—</li>
                      }
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags communautaires */}
          <TagVote
            perfumeId={perfume.id}
            perfumeSlug={slug}
            tagCounts={tagCounts}
            myTags={myTags}
            isAuthenticated={isAuthenticated}
          />

          <Separator className="border-border/30" />

          {/* Reviews + Stats */}
          <Tabs defaultValue="reviews">
            <TabsList>
              <TabsTrigger value="reviews">
                {perfume.reviews.length} avis
              </TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="pt-6 space-y-6">
              {perfume.reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun avis pour l&apos;instant. Soyez le premier.</p>
              ) : (
                perfume.reviews.map((review) => (
                  <div key={review.id} className="space-y-3 pb-6 lb-divider">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-muted">
                            {review.user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/profil/${review.user.username}`} className="text-sm font-semibold hover:text-primary transition-colors">
                            @{review.user.username}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs text-muted-foreground">{review.rating}/5</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(review.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>

                    {review.text && <p className="text-sm leading-relaxed">{review.text}</p>}

                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {review.longevity && (
                        <span className="bg-muted/60 rounded-full px-2.5 py-0.5 text-muted-foreground">Longévité {review.longevity}/5</span>
                      )}
                      {review.sillage && (
                        <span className="bg-muted/60 rounded-full px-2.5 py-0.5 text-muted-foreground">Sillage {review.sillage}/5</span>
                      )}
                      {review.valueForMoney && (
                        <span className="bg-muted/60 rounded-full px-2.5 py-0.5 text-muted-foreground">Q/P {review.valueForMoney}/5</span>
                      )}
                      {review.blindBuy !== null && (
                        <span className="bg-muted/60 rounded-full px-2.5 py-0.5 text-muted-foreground">
                          Blind buy {review.blindBuy ? "✓" : "✗"}
                        </span>
                      )}
                      {review.seasons.map((s) => (
                        <span key={s} className="bg-muted/40 rounded-full px-2.5 py-0.5 text-muted-foreground">{SEASON_LABEL[s]}</span>
                      ))}
                      {review.occasions.map((o) => (
                        <span key={o} className="bg-muted/40 rounded-full px-2.5 py-0.5 text-muted-foreground">{OCCASION_LABEL[o]}</span>
                      ))}
                    </div>

                    <CommentSection
                      reviewId={review.id}
                      perfumeSlug={slug}
                      comments={review.comments}
                      currentUsername={currentUsername}
                      isAuthenticated={isAuthenticated}
                    />
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="stats" className="pt-6 space-y-6">
              {perfume.reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">Pas encore de données.</p>
              ) : (
                <>
                  <div className="space-y-3 max-w-xs">
                    <p className="lb-section-title">Moyennes</p>
                    <StatBar label="Note globale" value={avgRating} />
                    <StatBar label="Longévité" value={avgLongevity} />
                    <StatBar label="Sillage" value={avgSillage} />
                    <StatBar label="Rapport Q/P" value={avgValue} />
                  </div>

                  {blindBuyTotal > 0 && (
                    <div className="space-y-1">
                      <p className="lb-section-title">Blind buy</p>
                      <p className="text-sm text-muted-foreground">
                        {blindBuyYes} sur {blindBuyTotal} l&apos;ont acheté sans le sentir
                      </p>
                    </div>
                  )}

                  {Object.keys(seasonCounts).length > 0 && (
                    <div className="space-y-2">
                      <p className="lb-section-title">Saisons recommandées</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(seasonCounts).sort(([, a], [, b]) => b - a).map(([s, count]) => (
                          <Badge key={s} variant="secondary">{SEASON_LABEL[s]} · {count}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(occasionCounts).length > 0 && (
                    <div className="space-y-2">
                      <p className="lb-section-title">Occasions</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(occasionCounts).sort(([, a], [, b]) => b - a).map(([o, count]) => (
                          <Badge key={o} variant="secondary">{OCCASION_LABEL[o]} · {count}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

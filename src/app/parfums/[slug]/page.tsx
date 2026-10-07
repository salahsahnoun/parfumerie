import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/parfum/StarRating";
import { ReviewForm } from "@/components/parfum/ReviewForm";
import { AddToCollectionButton } from "@/components/parfum/AddToCollectionButton";

interface Props {
  params: Promise<{ slug: string }>;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const perfume = await prisma.perfume.findUnique({
    where: { slug },
    select: { name: true, house: { select: { name: true } } },
  });
  if (!perfume) return { title: "Parfum introuvable" };
  return { title: `${perfume.name} — ${perfume.house.name}` };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avg(values: (number | null | undefined)[]) {
  const clean = values.filter((v): v is number => v != null);
  return clean.length ? clean.reduce((s, v) => s + v, 0) / clean.length : null;
}

function StatBar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  const pct = (value / 5) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(1)} / 5</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-foreground rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const GENDER_LABEL: Record<string, string> = {
  MASCULINE: "Pour homme",
  FEMININE:  "Pour femme",
  UNISEX:    "Unisexe",
};

const SEASON_LABEL: Record<string, string> = {
  SPRING: "Printemps", SUMMER: "Été", AUTUMN: "Automne", WINTER: "Hiver",
};

const OCCASION_LABEL: Record<string, string> = {
  OFFICE: "Bureau", EVENING: "Soirée", SPORT: "Sport", DATE: "Date", CASUAL: "Quotidien",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PerfumePage({ params }: Props) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const isAuthenticated = !!session;

  const perfume = await prisma.perfume.findUnique({
    where: { slug },
    include: {
      house: true,
      perfumers: { include: { perfumer: true } },
      notes: {
        include: { note: true },
        orderBy: { position: "asc" },
      },
      accords: {
        include: { accord: true },
        orderBy: { strength: "desc" },
      },
      reviews: {
        include: { user: { select: { username: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!perfume) notFound();

  // Statut de collection et review existante pour l'utilisateur connecté
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

  const topNotes    = perfume.notes.filter((n) => n.position === "TOP");
  const heartNotes  = perfume.notes.filter((n) => n.position === "HEART");
  const baseNotes   = perfume.notes.filter((n) => n.position === "BASE");

  const ratings     = perfume.reviews.map((r) => r.rating);
  const avgRating   = avg(ratings);
  const avgLongevity = avg(perfume.reviews.map((r) => r.longevity));
  const avgSillage   = avg(perfume.reviews.map((r) => r.sillage));
  const avgValue     = avg(perfume.reviews.map((r) => r.valueForMoney));

  const blindBuyYes = perfume.reviews.filter((r) => r.blindBuy === true).length;
  const blindBuyTotal = perfume.reviews.filter((r) => r.blindBuy !== null).length;

  // Compte des saisons et occasions
  const seasonCounts: Record<string, number> = {};
  const occasionCounts: Record<string, number> = {};
  for (const review of perfume.reviews) {
    for (const s of review.seasons) seasonCounts[s] = (seasonCounts[s] ?? 0) + 1;
    for (const o of review.occasions) occasionCounts[o] = (occasionCounts[o] ?? 0) + 1;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* ── Colonne gauche ── */}
        <div className="space-y-6">
          {/* Image du flacon */}
          <div className="aspect-square relative rounded-xl overflow-hidden bg-muted">
            {perfume.imageUrl ? (
              <Image
                src={perfume.imageUrl}
                alt={`${perfume.name} — ${perfume.house.name}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
                <span className="text-8xl font-bold text-stone-300 dark:text-stone-600 select-none">
                  {perfume.name[0]}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
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

          {/* Parfumeurs */}
          {perfume.perfumers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                {perfume.perfumers.length > 1 ? "Parfumeurs" : "Parfumeur"}
              </p>
              {perfume.perfumers.map(({ perfumer }) => (
                <Link
                  key={perfumer.id}
                  href={`/parfumeurs/${perfumer.slug}`}
                  className="block text-sm font-medium hover:underline"
                >
                  {perfumer.name}
                </Link>
              ))}
            </div>
          )}

          {/* Maison */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Maison</p>
            <Link
              href={`/maisons/${perfume.house.slug}`}
              className="text-sm font-medium hover:underline"
            >
              {perfume.house.name}
            </Link>
            {perfume.house.country && (
              <p className="text-xs text-muted-foreground">{perfume.house.country}</p>
            )}
          </div>
        </div>

        {/* ── Colonne droite ── */}
        <div className="md:col-span-2 space-y-6">

          {/* En-tête */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              {perfume.house.name}
            </p>
            <h1 className="text-4xl font-bold">{perfume.name}</h1>

            <div className="flex items-center gap-3 flex-wrap">
              {avgRating !== null ? (
                <>
                  <StarRating rating={avgRating} size="lg" />
                  <span className="text-muted-foreground text-sm">
                    {avgRating.toFixed(2)} · {perfume.reviews.length} note{perfume.reviews.length !== 1 ? "s" : ""}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">Pas encore noté</span>
              )}
            </div>
          </div>

          {/* Badges infos */}
          <div className="flex flex-wrap gap-2">
            {perfume.concentration && <Badge>{perfume.concentration}</Badge>}
            {perfume.year && <Badge variant="outline">{perfume.year}</Badge>}
            <Badge variant="outline">{GENDER_LABEL[perfume.gender]}</Badge>
            {perfume.accords.map(({ accord }) => (
              <Badge key={accord.id} variant="secondary">{accord.name}</Badge>
            ))}
          </div>

          {/* Description */}
          {perfume.description && (
            <p className="text-muted-foreground leading-relaxed">{perfume.description}</p>
          )}

          <Separator />

          {/* Pyramide olfactive */}
          <div className="space-y-4">
            <h2 className="font-semibold">Pyramide olfactive</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Tête",   notes: topNotes },
                { label: "Cœur",  notes: heartNotes },
                { label: "Fond",  notes: baseNotes },
              ].map(({ label, notes }) => (
                <div key={label} className="space-y-2">
                  <p className="text-muted-foreground uppercase text-xs tracking-widest">{label}</p>
                  <div className="flex flex-wrap gap-1">
                    {notes.length > 0
                      ? notes.map(({ note }) => (
                          <Badge key={note.id} variant="secondary" className="text-xs">
                            {note.name}
                          </Badge>
                        ))
                      : <span className="text-xs text-muted-foreground">—</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Onglets */}
          <Tabs defaultValue="reviews">
            <TabsList>
              <TabsTrigger value="reviews">
                Critiques ({perfume.reviews.length})
              </TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
            </TabsList>

            {/* ── Reviews ── */}
            <TabsContent value="reviews" className="pt-4 space-y-6">
              {perfume.reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Aucune critique pour l&apos;instant. Soyez le premier à noter ce parfum.
                </p>
              ) : (
                perfume.reviews.map((review) => (
                  <div key={review.id} className="space-y-3">
                    {/* En-tête review */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {review.user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/profil/${review.user.username}`}
                            className="text-sm font-medium hover:underline"
                          >
                            @{review.user.username}
                          </Link>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs text-muted-foreground">{review.rating} / 5</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Texte */}
                    {review.text && (
                      <p className="text-sm leading-relaxed">{review.text}</p>
                    )}

                    {/* Dimensions */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {review.longevity && (
                        <span className="bg-muted rounded px-2 py-0.5">
                          Longevité {review.longevity}/5
                        </span>
                      )}
                      {review.sillage && (
                        <span className="bg-muted rounded px-2 py-0.5">
                          Sillage {review.sillage}/5
                        </span>
                      )}
                      {review.valueForMoney && (
                        <span className="bg-muted rounded px-2 py-0.5">
                          Rapport Q/P {review.valueForMoney}/5
                        </span>
                      )}
                      {review.blindBuy !== null && (
                        <span className="bg-muted rounded px-2 py-0.5">
                          Blind buy : {review.blindBuy ? "✓ oui" : "✗ non"}
                        </span>
                      )}
                    </div>

                    {/* Saisons & occasions */}
                    <div className="flex flex-wrap gap-1">
                      {review.seasons.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs py-0">
                          {SEASON_LABEL[s]}
                        </Badge>
                      ))}
                      {review.occasions.map((o) => (
                        <Badge key={o} variant="outline" className="text-xs py-0">
                          {OCCASION_LABEL[o]}
                        </Badge>
                      ))}
                    </div>

                    <Separator />
                  </div>
                ))
              )}
            </TabsContent>

            {/* ── Stats ── */}
            <TabsContent value="stats" className="pt-4 space-y-6">
              {perfume.reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">Pas encore de données.</p>
              ) : (
                <>
                  <div className="space-y-3 max-w-sm">
                    <h3 className="text-sm font-semibold">Moyennes</h3>
                    <StatBar label="Note globale" value={avgRating} />
                    <StatBar label="Longevité"    value={avgLongevity} />
                    <StatBar label="Sillage"      value={avgSillage} />
                    <StatBar label="Rapport Q/P"  value={avgValue} />
                  </div>

                  {blindBuyTotal > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Blind buy</p>
                      <p className="text-sm text-muted-foreground">
                        {blindBuyYes} sur {blindBuyTotal} acheteurs l&apos;ont pris sans le sentir
                      </p>
                    </div>
                  )}

                  {Object.keys(seasonCounts).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Saisons recommandées</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(seasonCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([s, count]) => (
                            <Badge key={s} variant="secondary">
                              {SEASON_LABEL[s]} · {count}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(occasionCounts).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Occasions</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(occasionCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([o, count]) => (
                            <Badge key={o} variant="secondary">
                              {OCCASION_LABEL[o]} · {count}
                            </Badge>
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

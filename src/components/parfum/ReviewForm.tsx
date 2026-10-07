"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { upsertReview } from "@/app/parfums/[slug]/actions";
import type { Season, Occasion } from "@/generated/prisma/client";

const SEASONS: { value: Season; label: string }[] = [
  { value: "SPRING", label: "Printemps" },
  { value: "SUMMER", label: "Été" },
  { value: "AUTUMN", label: "Automne" },
  { value: "WINTER", label: "Hiver" },
];

const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: "OFFICE", label: "Bureau" },
  { value: "EVENING", label: "Soirée" },
  { value: "SPORT", label: "Sport" },
  { value: "DATE", label: "Date" },
  { value: "CASUAL", label: "Quotidien" },
];

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="text-2xl leading-none transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <span className={(hovered || value) >= star ? "text-yellow-400" : "text-muted-foreground"}>
            ★
          </span>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-muted-foreground self-center">{value}/5</span>
      )}
    </div>
  );
}

function ScoreInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? 0 : n)}
            className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
              value === n
                ? "bg-foreground text-background"
                : "bg-muted hover:bg-muted/70 text-muted-foreground"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

interface Props {
  perfumeSlug: string;
  isAuthenticated: boolean;
  existingRating?: number;
}

export function ReviewForm({ perfumeSlug, isAuthenticated, existingRating }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(existingRating ?? 0);
  const [text, setText] = useState("");
  const [longevity, setLongevity] = useState(0);
  const [sillage, setSillage] = useState(0);
  const [valueForMoney, setValueForMoney] = useState(0);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [blindBuy, setBlindBuy] = useState<boolean | null>(null);

  function toggleSeason(s: Season) {
    setSeasons((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }
  function toggleOccasion(o: Occasion) {
    setOccasions((prev) => prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]);
  }

  if (!isAuthenticated) {
    return (
      <a
        href="/connexion"
        className="w-full block text-center rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        {existingRating ? "Modifier mon avis" : "Ajouter une note"}
      </a>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        {existingRating ? "Modifier mon avis" : "Ajouter une note"}
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("La note est obligatoire."); return; }
    setError(null);
    setLoading(true);
    try {
      await upsertReview(perfumeSlug, {
        rating,
        text: text || undefined,
        longevity: longevity || undefined,
        sillage: sillage || undefined,
        valueForMoney: valueForMoney || undefined,
        seasons: seasons.length ? seasons : undefined,
        occasions: occasions.length ? occasions : undefined,
        blindBuy: blindBuy ?? undefined,
      });
      setOpen(false);
      router.refresh();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {existingRating ? "Modifier mon avis" : "Ajouter une note"}
        </p>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground text-xs hover:text-foreground">
          Annuler
        </button>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Note globale *</Label>
        <StarInput value={rating} onChange={setRating} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="review-text" className="text-xs text-muted-foreground">Votre avis</Label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Partagez votre expérience…"
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ScoreInput value={longevity} onChange={setLongevity} label="Longévité" />
        <ScoreInput value={sillage} onChange={setSillage} label="Sillage" />
        <ScoreInput value={valueForMoney} onChange={setValueForMoney} label="Rapport Q/P" />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Saisons</Label>
        <div className="flex flex-wrap gap-1">
          {SEASONS.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => toggleSeason(value)}>
              <Badge variant={seasons.includes(value) ? "default" : "outline"} className="cursor-pointer text-xs">
                {label}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Occasions</Label>
        <div className="flex flex-wrap gap-1">
          {OCCASIONS.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => toggleOccasion(value)}>
              <Badge variant={occasions.includes(value) ? "default" : "outline"} className="cursor-pointer text-xs">
                {label}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Blind buy ?</Label>
        <div className="flex gap-2">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => setBlindBuy(blindBuy === v ? null : v)}
              className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                blindBuy === v ? "bg-foreground text-background border-foreground" : "hover:bg-muted"
              }`}
            >
              {v ? "Oui" : "Non"}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Envoi…" : "Publier l'avis"}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createPerfume } from "@/app/parfums/actions";
import type { Gender } from "@/generated/prisma/client";

const CONCENTRATIONS = ["Parfum", "EDP", "EDT", "EDC", "Cologne", "Solid", "Oil", "Autre"];
const GENDERS: { value: Gender; label: string }[] = [
  { value: "UNISEX", label: "Unisexe" },
  { value: "MASCULINE", label: "Pour homme" },
  { value: "FEMININE", label: "Pour femme" },
];
const ACCORDS_SUGGESTIONS = [
  "Boisé", "Floral", "Oriental", "Frais", "Cuiré", "Gourmand",
  "Aromatique", "Aquatique", "Musqué", "Fruité", "Épicé", "Poudré",
];

export function NewPerfumeForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [houseName, setHouseName] = useState("");
  const [year, setYear] = useState("");
  const [concentration, setConcentration] = useState("");
  const [gender, setGender] = useState<Gender>("UNISEX");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [accords, setAccords] = useState<string[]>([]);
  const [accordInput, setAccordInput] = useState("");

  function addAccord(name: string) {
    const trimmed = name.trim();
    if (!trimmed || accords.includes(trimmed)) return;
    setAccords((prev) => [...prev, trimmed]);
    setAccordInput("");
  }
  function removeAccord(name: string) {
    setAccords((prev) => prev.filter((a) => a !== name));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !houseName.trim()) {
      setError("Le nom du parfum et la maison sont obligatoires.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await createPerfume({
        name,
        houseName,
        year: year ? parseInt(year) : undefined,
        concentration: concentration || undefined,
        gender,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        accords: accords.length ? accords : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du parfum *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Santal 33"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="house">Maison *</Label>
          <Input
            id="house"
            value={houseName}
            onChange={(e) => setHouseName(e.target.value)}
            placeholder="ex: Le Labo"
            required
          />
          <p className="text-xs text-muted-foreground">Créée automatiquement si elle n&apos;existe pas encore.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Année de sortie</Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="ex: 2011"
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>
        <div className="space-y-2">
          <Label>Concentration</Label>
          <div className="flex flex-wrap gap-1">
            {CONCENTRATIONS.map((c) => (
              <button key={c} type="button" onClick={() => setConcentration(concentration === c ? "" : c)}>
                <Badge variant={concentration === c ? "default" : "outline"} className="cursor-pointer text-xs">
                  {c}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Genre</Label>
        <div className="flex gap-2">
          {GENDERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setGender(value)}
              className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${
                gender === value ? "bg-foreground text-background border-foreground" : "hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notes olfactives, histoire, contexte…"
          rows={4}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL de l&apos;image</Label>
        <Input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
        />
      </div>

      <div className="space-y-3">
        <Label>Accords olfactifs</Label>
        <div className="flex flex-wrap gap-1">
          {ACCORDS_SUGGESTIONS.map((a) => (
            <button key={a} type="button" onClick={() => addAccord(a)}>
              <Badge variant={accords.includes(a) ? "default" : "outline"} className="cursor-pointer text-xs">
                {a}
              </Badge>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={accordInput}
            onChange={(e) => setAccordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAccord(accordInput); } }}
            placeholder="Autre accord…"
            className="max-w-xs"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => addAccord(accordInput)}>
            Ajouter
          </Button>
        </div>
        {accords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {accords.map((a) => (
              <button key={a} type="button" onClick={() => removeAccord(a)}>
                <Badge className="cursor-pointer text-xs gap-1">
                  {a} <span className="opacity-60">×</span>
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full md:w-auto px-8">
        {loading ? "Création en cours…" : "Publier le parfum"}
      </Button>
    </form>
  );
}

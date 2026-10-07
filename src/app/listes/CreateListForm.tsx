"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createList } from "./actions";

export function CreateListButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>Nouvelle liste</Button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Le titre est requis."); return; }
    setError(null);
    setLoading(true);
    try {
      await createList({ title, description: description || undefined, isPublic });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 w-full max-w-md">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">Nouvelle liste</p>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground text-xs hover:text-foreground">
          Annuler
        </button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="list-title">Titre *</Label>
        <Input
          id="list-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex: Mes parfums d'hiver"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="list-desc">Description</Label>
        <Input
          id="list-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optionnel…"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => setIsPublic(!isPublic)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isPublic ? "bg-foreground" : "bg-muted-foreground/40"}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-background shadow transition-transform ${isPublic ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
        <Label className="text-sm cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
          {isPublic ? "Publique" : "Privée"}
        </Label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Création…" : "Créer la liste"}
      </Button>
    </form>
  );
}

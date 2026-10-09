"use client";

import { useTransition } from "react";
import { toggleTag } from "@/app/parfums/[slug]/tag-actions";

export const PREDEFINED_TAGS = [
  "Budget",
  "Dupe",
  "Coup de cœur",
  "Soirée",
  "Quotidien",
  "Été",
  "Hiver",
  "Printemps",
  "Automne",
  "Bureau",
  "Sport",
  "Date",
  "Signature",
  "Niche",
  "Vintage",
];

interface Props {
  perfumeId: string;
  perfumeSlug: string;
  activeTags: string[];
  isAuthenticated: boolean;
}

export function TagVote({ perfumeId, perfumeSlug, activeTags, isAuthenticated }: Props) {
  const [pending, startTransition] = useTransition();

  function handleToggle(tag: string) {
    if (!isAuthenticated) return;
    startTransition(() => toggleTag(perfumeId, tag, perfumeSlug));
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">
        Catégories communautaires
      </p>
      <div className="flex flex-wrap gap-1.5">
        {PREDEFINED_TAGS.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => handleToggle(tag)}
              disabled={pending || !isAuthenticated}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                active
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:border-muted-foreground"
              } disabled:cursor-default`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      {!isAuthenticated && (
        <p className="text-[11px] text-muted-foreground">
          <a href="/connexion" className="hover:text-primary underline">Connectez-vous</a> pour voter sur les catégories.
        </p>
      )}
    </div>
  );
}

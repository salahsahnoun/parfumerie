"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const ACCORDS = [
  "Boisé", "Floral", "Oriental", "Frais", "Cuiré",
  "Gourmand", "Aromatique", "Aquatique", "Musqué", "Fruité", "Épicé", "Poudré",
];

interface Props {
  currentQuery?: string;
  currentAccord?: string;
}

export function CatalogueFilters({ currentQuery, currentAccord }: Props) {
  const router = useRouter();

  const navigate = useCallback(
    (q?: string, accord?: string) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (accord) params.set("accord", accord);
      router.push(`/parfums?${params.toString()}`);
    },
    [router]
  );

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (new FormData(e.currentTarget).get("q") as string).trim();
    navigate(q || undefined, currentAccord);
  }

  function toggleAccord(name: string) {
    navigate(currentQuery, currentAccord === name ? undefined : name);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch}>
        <Input
          name="q"
          defaultValue={currentQuery}
          placeholder="Rechercher un parfum, une maison, un parfumeur..."
          className="max-w-lg"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        {ACCORDS.map((accord) => (
          <Badge
            key={accord}
            variant={currentAccord === accord ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleAccord(accord)}
          >
            {accord}
          </Badge>
        ))}
        {currentAccord && (
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={() => navigate(currentQuery, undefined)}
          >
            ✕ Effacer le filtre
          </Badge>
        )}
      </div>
    </div>
  );
}

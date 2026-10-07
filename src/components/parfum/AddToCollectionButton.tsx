"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { upsertCollection, removeFromCollection } from "@/app/parfums/[slug]/actions";
import type { CollectionStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<CollectionStatus, string> = {
  OWNED: "Possédé ✓",
  TRIED: "Essayé ✓",
  WISHLIST: "Wishlist ✓",
  DECANT_WANTED: "Décant voulu ✓",
};

const STATUS_OPTIONS: { value: CollectionStatus; label: string }[] = [
  { value: "OWNED", label: "Possédé" },
  { value: "TRIED", label: "Essayé" },
  { value: "WISHLIST", label: "Wishlist" },
  { value: "DECANT_WANTED", label: "Décant voulu" },
];

interface Props {
  perfumeId: string;
  isAuthenticated: boolean;
  currentStatus?: CollectionStatus | null;
}

export function AddToCollectionButton({ perfumeId, isAuthenticated, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <a
        href="/connexion"
        className="w-full block text-center rounded-lg border py-2 text-sm font-medium hover:bg-muted transition-colors"
      >
        Ajouter à ma collection
      </a>
    );
  }

  async function handleSelect(status: CollectionStatus) {
    setLoading(true);
    await upsertCollection(perfumeId, status);
    setLoading(false);
    router.refresh();
  }

  async function handleRemove() {
    setLoading(true);
    await removeFromCollection(perfumeId);
    setLoading(false);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          disabled={loading}
          className={`w-full rounded-lg border py-2 text-sm font-medium transition-colors ${
            currentStatus ? "bg-muted" : "hover:bg-muted"
          }`}
        >
          {loading
            ? "…"
            : currentStatus
            ? STATUS_LABELS[currentStatus]
            : "Ajouter à ma collection"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => handleSelect(value)}
            className={currentStatus === value ? "font-semibold" : ""}
          >
            {label}
          </DropdownMenuItem>
        ))}
        {currentStatus && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={handleRemove}>
              Retirer de ma collection
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

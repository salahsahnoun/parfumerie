"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Image" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur lors de l'envoi");
      return;
    }
    onChange(data.url);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>

      {/* Zone de drop / preview */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative cursor-pointer rounded-lg border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors overflow-hidden"
        style={{ aspectRatio: "2/3", maxWidth: 160 }}
      >
        {value ? (
          <Image src={value} alt="Aperçu" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground select-none">
            {uploading ? (
              <span className="text-xs">Envoi…</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span className="text-xs text-center px-2">Photo du flacon</span>
                <span className="text-[10px] text-muted-foreground/60">JPG, PNG, WEBP · max 5 Mo</span>
              </>
            )}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-xs">Envoi…</span>
          </div>
        )}
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Supprimer l&apos;image
        </button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

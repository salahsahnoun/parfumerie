"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { addComment, deleteComment } from "@/app/parfums/[slug]/comment-actions";

interface CommentData {
  id: string;
  text: string;
  createdAt: Date;
  user: { username: string };
}

interface Props {
  reviewId: string;
  perfumeSlug: string;
  comments: CommentData[];
  currentUsername?: string;
  isAuthenticated: boolean;
}

export function CommentSection({ reviewId, perfumeSlug, comments, currentUsername, isAuthenticated }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      await addComment(reviewId, text, perfumeSlug);
      setText("");
      setOpen(false);
    });
  }

  function handleDelete(commentId: string) {
    startTransition(() => deleteComment(commentId, perfumeSlug));
  }

  return (
    <div className="space-y-2">
      {/* Afficher les commentaires existants */}
      {comments.length > 0 && (
        <div className="space-y-2 pl-4 border-l border-border/40">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 group">
              <Avatar className="h-5 w-5 shrink-0 mt-0.5">
                <AvatarFallback className="text-[9px] bg-muted">
                  {c.user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold">
                  <Link href={`/profil/${c.user.username}`} className="hover:text-primary transition-colors">
                    {c.user.username}
                  </Link>
                </span>
                <span className="text-xs text-muted-foreground ml-2">{c.text}</span>
              </div>
              {currentUsername === c.user.username && (
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={pending}
                  className="text-[10px] text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bouton + formulaire */}
      {isAuthenticated && (
        !open ? (
          <button
            onClick={() => setOpen(true)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Répondre
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 items-center pl-4">
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ajouter un commentaire…"
              maxLength={1000}
              className="flex-1 text-xs bg-transparent border-b border-border/60 outline-none py-0.5 placeholder:text-muted-foreground/50"
            />
            <button
              type="submit"
              disabled={pending || !text.trim()}
              className="text-xs text-primary disabled:opacity-40"
            >
              Publier
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setText(""); }}
              className="text-xs text-muted-foreground"
            >
              Annuler
            </button>
          </form>
        )
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/parfums", label: "Parfums" },
  { href: "/maisons", label: "Maisons" },
  { href: "/parfumeurs", label: "Parfumeurs" },
];

interface Props {
  username?: string;
}

export function MobileMenu({ username }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
      >
        <span className={`block h-0.5 w-5 bg-foreground transition-all duration-200 ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`block h-0.5 w-5 bg-foreground transition-all duration-200 ${open ? "opacity-0" : ""}`} />
        <span className={`block h-0.5 w-5 bg-foreground transition-all duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {open && (
        <div className="fixed inset-0 top-14 z-40 bg-background/98 backdrop-blur flex flex-col px-6 py-8 gap-2 md:hidden">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-xl font-semibold py-3 border-b border-border/30 text-foreground hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}

          <div className="mt-auto flex flex-col gap-3 pt-8">
            {username ? (
              <>
                <Link
                  href={`/profil/${username}`}
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mon profil (@{username})
                </Link>
                <Link
                  href="/parfums/nouveau"
                  onClick={() => setOpen(false)}
                  className="block text-center py-2.5 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
                >
                  + Ajouter un parfum
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  onClick={() => setOpen(false)}
                  className="block text-center py-2.5 px-5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  onClick={() => setOpen(false)}
                  className="block text-center py-2.5 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
                >
                  S&apos;inscrire gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

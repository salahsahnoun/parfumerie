import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NavbarUserMenu } from "./NavbarUserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { href: "/parfums", label: "Parfums" },
  { href: "/maisons", label: "Maisons" },
  { href: "/parfumeurs", label: "Parfumeurs" },
];

export async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as ({ username?: string } & Record<string, unknown>) | undefined;
  const username = user?.username as string | undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="font-bold text-xl tracking-tight lb-green shrink-0">
          parfumerie
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-medium">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          {username ? (
            <>
              <Link
                href="/parfums/nouveau"
                className="hidden sm:flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                + Parfum
              </Link>
              <NavbarUserMenu username={username} initial={username[0].toUpperCase()} />
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/connexion"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                S&apos;inscrire
              </Link>
            </div>
          )}
          <MobileMenu username={username} />
        </div>
      </div>
    </header>
  );
}

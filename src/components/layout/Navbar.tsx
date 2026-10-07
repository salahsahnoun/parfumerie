import Link from "next/link";
import { headers } from "next/headers";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { NavbarUserMenu } from "./NavbarUserMenu";

const NAV_LINKS = [
  { href: "/parfums", label: "Films" },
  { href: "/maisons", label: "Maisons" },
  { href: "/parfumeurs", label: "Parfumeurs" },
  { href: "/listes", label: "Listes" },
];

export async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as ({ username?: string } & Record<string, unknown>) | undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 h-12 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg tracking-tight lb-green shrink-0">
          parfumerie
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-5 text-xs uppercase tracking-widest font-medium flex-1">
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

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {user && user.username ? (
            <>
              <Link
                href="/parfums/nouveau"
                className="hidden sm:block text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mr-2"
              >
                + Parfum
              </Link>
              <NavbarUserMenu
                username={user.username as string}
                initial={(user.username as string)[0].toUpperCase()}
              />
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs uppercase tracking-widest")}
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className={cn(buttonVariants({ size: "sm" }), "text-xs uppercase tracking-widest")}
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

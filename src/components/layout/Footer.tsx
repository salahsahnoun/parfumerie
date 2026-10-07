import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="space-y-3">
            <p className="font-semibold">Parfumerie</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              La plateforme communautaire pour les passionnés de fragrances.
            </p>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Découvrir</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/parfums" className="hover:text-foreground transition-colors">Catalogue</Link></li>
              <li><Link href="/maisons" className="hover:text-foreground transition-colors">Maisons</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Compte</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/inscription" className="hover:text-foreground transition-colors">S&apos;inscrire</Link></li>
              <li><Link href="/connexion" className="hover:text-foreground transition-colors">Connexion</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Projet</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/a-propos" className="hover:text-foreground transition-colors">À propos</Link></li>
            </ul>
          </div>
        </div>
        <Separator className="my-6" />
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Parfumerie. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

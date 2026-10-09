import type { Metadata } from "next";
import Link from "next/link";
import { InscriptionForm } from "./InscriptionForm";

export const metadata: Metadata = { title: "Inscription" };

export default function InscriptionPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="text-2xl font-bold lb-green">
            parfumerie
          </Link>
          <p className="text-muted-foreground text-sm">
            Rejoignez la communauté des parfumophiles
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border/40 p-6 space-y-6">
          <InscriptionForm />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

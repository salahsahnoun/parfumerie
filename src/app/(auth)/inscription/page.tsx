import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { InscriptionForm } from "./InscriptionForm";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function InscriptionPage() {
  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Rejoignez la communauté des parfumophiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InscriptionForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/connexion" className={cn(buttonVariants({ variant: "link" }), "p-0 h-auto")}>
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

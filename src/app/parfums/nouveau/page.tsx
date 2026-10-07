import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NewPerfumeForm } from "./NewPerfumeForm";

export const metadata: Metadata = {
  title: "Ajouter un parfum",
};

export default async function NouveauParfumPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/connexion");

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Ajouter un parfum</h1>
        <p className="text-muted-foreground">
          Ce parfum n&apos;est pas encore dans le catalogue ? Soumettez-le pour enrichir la base commune.
        </p>
      </div>
      <NewPerfumeForm />
    </div>
  );
}

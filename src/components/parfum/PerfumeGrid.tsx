import { PerfumeCard, type PerfumeCardData } from "./PerfumeCard";

interface PerfumeGridProps {
  perfumes: PerfumeCardData[];
}

export function PerfumeGrid({ perfumes }: PerfumeGridProps) {
  if (perfumes.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p className="text-4xl mb-3">&#x1F9F4;</p>
        <p className="font-medium">Aucun parfum pour l&apos;instant</p>
        <p className="text-sm">Le catalogue se remplit bientôt.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
      {perfumes.map((perfume) => (
        <PerfumeCard key={perfume.slug} {...perfume} />
      ))}
    </div>
  );
}

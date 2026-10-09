import Link from "next/link";
import Image from "next/image";

export interface PerfumeCardData {
  slug: string;
  name: string;
  house: string;
  imageUrl?: string;
  year?: number;
  rating?: number;
  reviewCount?: number;
  accords?: string[];
}

export function PerfumeCard({ slug, name, house, imageUrl, rating, reviewCount }: PerfumeCardData) {
  return (
    <Link href={`/parfums/${slug}`} className="group block lb-card-hover">
      <div className="aspect-[2/3] relative overflow-hidden rounded-md bg-card">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${name} — ${house}`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 16vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-card select-none gap-2 px-2">
            <span className="text-3xl font-bold text-muted-foreground/30 leading-none">
              {name[0]}
            </span>
            <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest text-center leading-tight">
              {house}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent group-hover:from-primary/10 transition-colors duration-200" />

        {rating !== undefined && (
          <div className="absolute bottom-1.5 left-1.5 bg-black/70 rounded px-1.5 py-0.5 flex items-center gap-1">
            <span className="text-amber-400 text-[10px] leading-none">★</span>
            <span className="text-[10px] text-white font-semibold leading-none">{rating.toFixed(1)}</span>
            {reviewCount && (
              <span className="text-[9px] text-white/50 leading-none">({reviewCount})</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 space-y-0.5 px-0.5">
        <p className="text-sm font-semibold leading-tight truncate group-hover:text-primary transition-colors">
          {name}
        </p>
        <p className="text-xs text-muted-foreground truncate">{house}</p>
      </div>
    </Link>
  );
}

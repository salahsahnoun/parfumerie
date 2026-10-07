import Link from "next/link";
import Image from "next/image";
import { StarRating } from "./StarRating";

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

export function PerfumeCard({
  slug, name, house, imageUrl, year, rating, reviewCount,
}: PerfumeCardData) {
  return (
    <Link href={`/parfums/${slug}`} className="group block lb-card-hover">
      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden rounded-sm bg-card">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${name} — ${house}`}
            fill
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 22vw, 16vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-card to-muted select-none gap-2">
            <span className="text-4xl font-bold text-muted-foreground/40 leading-none">
              {name[0]}
            </span>
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest px-2 text-center leading-tight">
              {house}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

        {/* Rating badge on hover */}
        {rating !== undefined && (
          <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black/80 rounded px-1.5 py-0.5 flex items-center gap-1">
              <span className="text-[10px] text-amber-400 font-bold">{rating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Info below */}
      <div className="mt-1.5 space-y-0.5 px-0.5">
        <p className="text-xs font-semibold leading-tight truncate text-foreground group-hover:text-primary transition-colors">
          {name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">{house}</p>
        {(year !== undefined || rating !== undefined) && (
          <div className="flex items-center gap-2">
            {year && <span className="text-[10px] text-muted-foreground">{year}</span>}
            {rating !== undefined && (
              <div className="flex items-center gap-1">
                <StarRating rating={rating} size="sm" />
                {reviewCount && (
                  <span className="text-[10px] text-muted-foreground">({reviewCount})</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

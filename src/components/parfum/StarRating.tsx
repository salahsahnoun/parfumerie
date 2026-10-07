import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({ rating, max = 5, size = "md", className }: StarRatingProps) {
  const sizes = { sm: "text-xs", md: "text-sm", lg: "text-lg" };

  return (
    <span className={cn("inline-flex items-center gap-0.5", sizes[size], className)}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i + 1 <= Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <span key={i} className={cn(filled || half ? "text-amber-400" : "text-muted-foreground/30")}>
            {half ? "½" : "★"}
          </span>
        );
      })}
    </span>
  );
}

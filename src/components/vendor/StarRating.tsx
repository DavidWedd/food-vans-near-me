import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  showCount?: boolean;
}

export function StarRating({
  rating,
  reviewCount,
  size = 14,
  showCount = true,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="inline-flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            fill={i < fullStars || (i === fullStars && hasHalf) ? 'var(--primary)' : 'none'}
            stroke="var(--primary)"
            strokeWidth={1.5}
            opacity={i > fullStars ? 0.3 : 1}
          />
        ))}
      </div>
      <span
        className="text-[13px] font-semibold"
        style={{ color: 'var(--text)' }}
      >
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount !== undefined && (
        <span
          className="text-[12px]"
          style={{ color: 'var(--muted)' }}
        >
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

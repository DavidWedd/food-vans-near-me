export function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      aria-hidden="true"
    >
      {/* Image skeleton */}
      <div className="skeleton aspect-video w-full" />

      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="skeleton h-5 rounded-full w-3/4" />
        {/* Chips */}
        <div className="flex gap-2">
          <div className="skeleton h-5 rounded-full w-16" />
          <div className="skeleton h-5 rounded-full w-20" />
        </div>
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="skeleton h-4 rounded-full w-24" />
          <div className="skeleton h-4 rounded-full w-12" />
        </div>
        {/* Meta */}
        <div className="flex gap-3">
          <div className="skeleton h-4 rounded-full w-16" />
          <div className="skeleton h-4 rounded-full w-8" />
        </div>
      </div>
    </div>
  );
}

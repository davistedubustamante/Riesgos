import { cn } from '@/lib/utils';

/**
 * Premium Skeleton Component with shimmer animation
 * Used for loading states throughout the app
 */
export function Skeleton({ 
  className, 
  variant = 'default',
  width,
  height,
  count = 1,
  ...props 
}) {
  const variants = {
    default: 'animate-shimmer rounded-md',
    circular: 'animate-shimmer rounded-full',
    text: 'animate-shimmer rounded h-4',
    title: 'animate-shimmer rounded h-6 w-3/4',
    avatar: 'animate-shimmer rounded-full',
    card: 'animate-shimmer rounded-xl',
    metric: 'animate-shimmer rounded-lg h-20',
  };

  const baseClass = variants[variant] || variants.default;

  if (count > 1) {
    return (
      <div className="flex flex-col gap-2" {...props}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClass, className)}
            style={{
              width,
              height,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClass, className)}
      style={{ width, height }}
      {...props}
    />
  );
}

/**
 * Skeleton variants for specific use cases
 */
export function SkeletonCard({ className, ...props }) {
  return (
    <div className={cn('space-y-3 p-4 rounded-xl border', className)} {...props}>
      <Skeleton variant="text" className="w-1/2" />
      <Skeleton variant="title" />
      <div className="flex gap-2">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" className="w-1/4" />
      </div>
      <Skeleton variant="text" className="w-2/3" />
    </div>
  );
}

export function SkeletonMetric({ className, ...props }) {
  return (
    <div className={cn('p-4 rounded-xl border', className)} {...props}>
      <Skeleton variant="text" className="w-1/2 mb-2" />
      <Skeleton variant="title" className="w-3/4" />
      <Skeleton variant="text" className="w-1/3 mt-2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className, ...props }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {/* Header */}
      <div className="flex gap-4 p-3 rounded-lg bg-muted/30">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-3 rounded-lg border">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              variant="text" 
              className="flex-1" 
              style={{ animationDelay: `${(rowIndex * cols + colIndex) * 0.02}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 3, className, ...props }) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <Skeleton variant="avatar" className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

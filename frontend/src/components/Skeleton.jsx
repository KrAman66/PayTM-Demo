const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
      </div>
    ))}
  </div>
);

export default Skeleton;

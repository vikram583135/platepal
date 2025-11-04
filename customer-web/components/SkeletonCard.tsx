export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-md shadow-md overflow-hidden animate-pulse">
      <div className="h-40 w-full bg-gray-200 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4 skeleton" />
        <div className="h-4 bg-gray-200 rounded w-full skeleton" />
        <div className="h-4 bg-gray-200 rounded w-5/6 skeleton" />
        <div className="flex items-center justify-between mt-3">
          <div className="h-4 bg-gray-200 rounded w-16 skeleton" />
          <div className="h-4 bg-gray-200 rounded w-20 skeleton" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonMenuCard() {
  return (
    <div className="bg-white rounded-md shadow-sm border border-neutral-border overflow-hidden animate-pulse">
      <div className="flex gap-3 p-3">
        <div className="w-24 h-24 bg-gray-200 rounded-lg skeleton flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 skeleton" />
          <div className="h-3 bg-gray-200 rounded w-full skeleton" />
          <div className="h-3 bg-gray-200 rounded w-5/6 skeleton" />
          <div className="flex items-center justify-between mt-2">
            <div className="h-4 bg-gray-200 rounded w-12 skeleton" />
            <div className="w-8 h-8 bg-gray-200 rounded-full skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}


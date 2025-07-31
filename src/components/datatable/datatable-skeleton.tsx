import { Skeleton } from "../ui/skeleton";

export function DatatableSkeleton() {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <Skeleton className="w-96 h-7" />
        <Skeleton className="w-20 h-7" />
      </div>
      <Skeleton className="w-full h-40" />
      <div className="flex justify-between mt-4">
        <Skeleton className="w-40 h-7" />
        <Skeleton className="w-38 h-7" />
      </div>
    </div>
  );
}

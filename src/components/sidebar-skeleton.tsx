import { Skeleton } from "./ui/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="p-2 flex w-full h-full flex-col justify-between">
      <div className="flex flex-col gap-3">
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-28 h-6" />
        <Skeleton className="w-52 h-6" />
        <Skeleton className="w-36 h-6" />
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-40 h-6" />
      </div>

      <div className="flex gap-2 items-center">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex flex-col gap-1">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-28 h-5" />
        </div>
      </div>
    </div>
  );
}

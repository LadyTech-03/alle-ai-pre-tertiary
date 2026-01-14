import { cn } from "@/lib/utils";
import Image from "next/image";
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative", className)} {...props}>
      {/* Skeleton Animation */}
      <div className={cn("animate-pulse rounded-md bg-muted", className)} />

      {/* Spinner Overlay */}
      <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
        <Image
          width={20}
          height={20}
          src="/svgs/spinner.gif"
          alt="Loading..."
          className="w-20 h-20"
        />
      </div>
    </div>
  );
}

export { Skeleton };

import { env } from "@/env";

export function TailwindIndicator() {
  if (env.NODE_ENV === "production") return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex items-center justify-center">
      <div className="flex size-8 items-center justify-center rounded-full bg-gray-800 p-3 font-mono text-xs text-white">
        {[
          { label: "xs", visible: "block sm:hidden" },
          { label: "sm", visible: "hidden sm:block md:hidden" },
          { label: "md", visible: "hidden md:block lg:hidden" },
          { label: "lg", visible: "hidden lg:block xl:hidden" },
          { label: "xl", visible: "hidden xl:block 2xl:hidden" },
          { label: "2xl", visible: "hidden 2xl:block" },
        ].map((size) => (
          <div key={size.label} className={size.visible}>
            {size.label}
          </div>
        ))}
      </div>
    </div>
  );
}

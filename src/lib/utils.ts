import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function createEnumObject<T extends readonly [string, ...string[]]>(
  values: T,
): Record<T[number], T[number]> {
  const obj: Record<string, T[number]> = {};
  for (const value of values) {
    obj[value] = value;
  }
  return obj;
}

import { config } from "@/components/config";
import { getBackendURL } from "@/utils/utilities";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type GroupBy<T, K extends keyof T> = Record<string, T[]>;

export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): GroupBy<T, K> {
  return array.reduce(
    (acc, item) => {
      const keyValue = String(item[key]);
      if (!acc[keyValue]) {
        acc[keyValue] = [];
      }
      acc[keyValue].push(item);
      return acc;
    },
    {} as GroupBy<T, K>
  );
}

export function absoluteUrl(path: string) {
  return process.env.NODE_ENV === "development"
    ? `${process.env.DOMAIN}${path}`
    : `https://${config.appUrl}${path}`;
}

export const launchSEB = () => {
  if (process.env.NODE_ENV == "development") {
    window.location.href = `seb://localhost:5000/api/seb/config`;
  } else {
    window.location.href = `seb://codecoliseum.in/api/seb/config`;
  }
};

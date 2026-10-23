import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

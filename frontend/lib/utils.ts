import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getRiskColor(
  risk: string | null | undefined,
  variant: "bg" | "text" | "border" | "badge" = "badge"
): string {
  const r = (risk || "unknown").toLowerCase();
  if (variant === "badge") {
    if (r === "high") return "bg-red-100 text-red-700 border border-red-200";
    if (r === "medium") return "bg-amber-100 text-amber-700 border border-amber-200";
    if (r === "low") return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    return "bg-slate-100 text-slate-600 border border-slate-200";
  }
  if (variant === "bg") {
    if (r === "high") return "bg-red-500";
    if (r === "medium") return "bg-amber-500";
    if (r === "low") return "bg-emerald-500";
    return "bg-slate-400";
  }
  if (variant === "text") {
    if (r === "high") return "text-red-600";
    if (r === "medium") return "text-amber-600";
    if (r === "low") return "text-emerald-600";
    return "text-slate-500";
  }
  if (variant === "border") {
    if (r === "high") return "border-red-300";
    if (r === "medium") return "border-amber-300";
    if (r === "low") return "border-emerald-300";
    return "border-slate-200";
  }
  return "";
}

export function getRiskEmoji(risk: string | null | undefined): string {
  const r = (risk || "unknown").toLowerCase();
  if (r === "high") return "🔴";
  if (r === "medium") return "🟡";
  if (r === "low") return "🟢";
  return "⚪";
}

export function getRiskLabel(risk: string | null | undefined): string {
  const r = (risk || "unknown").toLowerCase();
  if (r === "high") return "High Risk";
  if (r === "medium") return "Needs Review";
  if (r === "low") return "Safe";
  return "Unknown";
}

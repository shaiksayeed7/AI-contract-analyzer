"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Upload,
  MessageSquare,
  GitCompare,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Contract", icon: Upload },
  { href: "/contracts", label: "My Contracts", icon: FileText },
  { href: "/contracts/compare", label: "Compare", icon: GitCompare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm">LexiScan</span>
            <span className="font-bold text-indigo-600 text-sm"> AI</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-indigo-700">Free Plan</p>
          <p className="text-xs text-slate-500 mt-0.5">5 contracts / month</p>
          <Link
            href="/pricing"
            className="mt-2 block text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Upgrade to Pro →
          </Link>
        </div>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "ホーム", href: "/", icon: "🏠" },
  { label: "ステーキング", href: "/staking", icon: "🌱" },
  { label: "履歴", href: "/history", icon: "📋" },
  { label: "設定", href: "/settings", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-300 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      <div className="mx-auto max-w-lg flex justify-around items-center h-18 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-18 transition-colors ${
                isActive ? "text-sky-500" : "text-slate-400"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[11px] font-black">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

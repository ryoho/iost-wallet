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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-lg flex justify-around items-center h-16 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center gap-0.5 h-16 min-w-[64px] ${isActive ? "text-blue-500" : "text-gray-400"}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

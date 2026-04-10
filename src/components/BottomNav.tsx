"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap, Sprout, ScrollText, Settings } from "lucide-react";

const navItems = [
  { label: "ホーム", href: "/", icon: Home as React.ComponentType<{ className?: string }> },
  { label: "Gas", href: "/gas", icon: Zap as React.ComponentType<{ className?: string }> },
  { label: "ステーキング", href: "/staking", icon: Sprout as React.ComponentType<{ className?: string }> },
  { label: "履歴", href: "/history", icon: ScrollText as React.ComponentType<{ className?: string }> },
  { label: "設定", href: "/settings", icon: Settings as React.ComponentType<{ className?: string }> },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-text-primary">
      <div className="mx-auto max-w-lg flex justify-around items-center h-16 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center gap-0.5 h-16 min-w-[56px] transition-colors ${isActive ? "text-[#c24b46]" : "text-text-secondary hover:text-text-primary"}`}>
              <item.icon className={`w-5 h-5 ${isActive ? "stroke-[#c24b46]" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { ArrowUpRight, ArrowDownLeft, Sprout, Zap } from "lucide-react";

interface QuickActionsProps {
  onSend: () => void;
  onReceive: () => void;
  onStake: () => void;
  onGas: () => void;
}

const actions = [
  { label: "送る", key: "send" as const, icon: ArrowUpRight },
  { label: "受け取る", key: "receive" as const, icon: ArrowDownLeft },
  { label: "Gas", key: "gas" as const, icon: Zap },
  { label: "投票", key: "stake" as const, icon: Sprout },
];

export default function QuickActions({ onSend, onReceive, onStake, onGas }: QuickActionsProps) {
  const handlers = { send: onSend, receive: onReceive, gas: onGas, stake: onStake };
  return (
    <div className="flex justify-around py-4">
      {actions.map((a) => (
        <button key={a.key} onClick={handlers[a.key]} className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-none bg-card border-2 border-text-primary retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center">
            <a.icon className="w-6 h-6 text-text-primary" />
          </div>
          <span className="text-xs text-text-primary font-medium">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

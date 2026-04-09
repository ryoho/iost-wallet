"use client";

interface QuickActionsProps {
  onSend: () => void;
  onReceive: () => void;
  onStake: () => void;
}

const actions = [
  { label: "送る", key: "send" as const, icon: "📤" },
  { label: "受け取る", key: "receive" as const, icon: "📥" },
  { label: "増やす", key: "stake" as const, icon: "🌱" },
];

export default function QuickActions({ onSend, onReceive, onStake }: QuickActionsProps) {
  const handlers = { send: onSend, receive: onReceive, stake: onStake };
  return (
    <div className="flex justify-around py-3">
      {actions.map((a) => (
        <button key={a.key} onClick={handlers[a.key]} className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xl">{a.icon}</span>
          </div>
          <span className="text-xs text-gray-600 font-medium">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

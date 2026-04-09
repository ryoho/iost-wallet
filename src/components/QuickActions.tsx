"use client";

interface QuickActionsProps {
  onSend: () => void;
  onReceive: () => void;
  onStake: () => void;
}

const actions = [
  { label: "送る", sublabel: "Send", key: "send" as const, icon: "📤" },
  { label: "受け取る", sublabel: "Receive", key: "receive" as const, icon: "📥" },
  { label: "増やす", sublabel: "Stake", key: "stake" as const, icon: "🌱" },
];

export default function QuickActions({ onSend, onReceive, onStake }: QuickActionsProps) {
  const actionHandlers = { send: onSend, receive: onReceive, stake: onStake };

  return (
    <div className="flex justify-around items-center py-4">
      {actions.map((action) => (
        <button
          key={action.key}
          onClick={actionHandlers[action.key]}
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
            <span className="text-2xl">{action.icon}</span>
          </div>
          <div className="text-center">
            <p className="text-slate-700 text-sm font-black">{action.label}</p>
            <p className="text-slate-400 text-[10px] font-bold">{action.sublabel}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

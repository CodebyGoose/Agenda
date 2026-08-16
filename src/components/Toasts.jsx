import React from "react";
import { BellRing, X } from "lucide-react";

export default function Toasts({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((t) => (
        <div key={t.id} className="bg-neutral-900 border border-neutral-800 rounded-md p-3 shadow-lg flex items-start gap-3">
          <BellRing size={16} className="text-teal-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-neutral-100 truncate">{t.title}</div>
            <div className="text-xs text-neutral-500 mt-0.5">{t.body}</div>
          </div>
          <button onClick={() => dismiss(t.id)} className="ml-auto text-neutral-600 hover:text-neutral-300 shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

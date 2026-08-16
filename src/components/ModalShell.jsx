import React from "react";
import { X, AlertTriangle } from "lucide-react";

export function ModalShell({ title, icon: Icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-xl md:rounded-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 sticky top-0 bg-neutral-900">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Icon size={16} className="text-teal-400" />{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"><X size={16} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-neutral-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function ConfirmModal({ label, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-rose-400" />
          <h3 className="text-sm font-semibold">Delete "{label}"?</h3>
        </div>
        <p className="text-xs text-neutral-500 mb-4">This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-md border border-neutral-800 hover:border-neutral-700 text-sm font-medium text-neutral-300">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-rose-500 hover:bg-rose-400 text-neutral-950 text-sm font-medium">Delete</button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 ${
        type === "success"
          ? "bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534]"
          : "bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B]"
      }`}
    >
      <span className="text-xl">
        {type === "success" ? "✅" : "❌"}
      </span>
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-4 text-current opacity-60 hover:opacity-100 transition-opacity">✕</button>
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1C1C1C]/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-[#E5E7EB] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#1C1C1C]" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-[#F3F4F6] text-[#6B7280] transition-colors">✕</button>
        </div>
        <div className="px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}

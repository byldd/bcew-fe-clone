"use client";
import React from "react";
import { X } from "lucide-react";

interface CustomRerunModalProps {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  show: boolean;
}

const CustomRerunModal: React.FC<CustomRerunModalProps> = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  onClose,
  show,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X size={18} />
        </button>
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="border border-black text-black rounded-lg px-4 py-2 font-medium hover:bg-gray-100"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="bg-black text-white rounded-lg px-4 py-2 font-medium hover:bg-gray-800"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomRerunModal;

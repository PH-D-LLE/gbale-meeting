import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void; // If provided, shows a Cancel button
  confirmText?: string;
  cancelText?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "확인",
  cancelText = "취소"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        <div className="p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{message}</p>
        </div>
        <div className="flex border-t border-gray-200">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 text-gray-600 hover:bg-gray-50 font-medium border-r border-gray-200 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 text-blue-600 hover:bg-blue-50 font-bold transition-colors ${!onCancel ? 'w-full' : ''}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
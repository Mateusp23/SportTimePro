// components/Alert.tsx
import React, { useEffect } from "react";

type AlertType = "success" | "error" | "warning" | "info";

type BaseProps = {
  type: AlertType;
  title: string;
  message: string;
};

type SingleActionProps = BaseProps & {
  // modo 1 botão (compatível com o que você já usa)
  onClose: () => void;
  buttonText?: string;
};

type ConfirmActionProps = BaseProps & {
  // modo confirmação (2 botões)
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

export type AlertProps = SingleActionProps | ConfirmActionProps;

const alertConfig = {
  success: {
    icon: (
      <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titleColor: "text-green-900",
    bgColor: "bg-green-50",
    buttonColor: "bg-green-600 hover:bg-green-700"
  },
  error: {
    icon: (
      <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titleColor: "text-red-900",
    bgColor: "bg-red-50",
    buttonColor: "bg-red-600 hover:bg-red-700"
  },
  warning: {
    icon: (
      <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    titleColor: "text-yellow-900",
    bgColor: "bg-yellow-50",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700"
  },
  info: {
    icon: (
      <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titleColor: "text-blue-900",
    bgColor: "bg-blue-50",
    buttonColor: "bg-blue-600 hover:bg-blue-700"
  }
};

export default function Alert(props: AlertProps) {
  const config = alertConfig[props.type];

  // acessibilidade: ESC fecha / Enter confirma (quando houver confirm)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ("onConfirm" in props && "onCancel" in props) {
        if (e.key === "Enter") props.onConfirm();
        if (e.key === "Escape") props.onCancel();
      } else if (e.key === "Escape") {
        props.onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props]);

  const isConfirm = "onConfirm" in props && "onCancel" in props;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">{config.icon}</div>
          <div className="ml-3">
            <h3 className={`text-lg font-medium ${config.titleColor}`}>{props.title}</h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">{props.message}</p>
        </div>

        <div className="flex justify-end gap-3">
          {isConfirm ? (
            <>
              <button
                onClick={props.onCancel}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                {props.cancelText ?? "Cancelar"}
              </button>
              <button
                onClick={props.onConfirm}
                className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 cursor-pointer ${config.buttonColor}`}
              >
                {props.confirmText ?? "Confirmar"}
              </button>
            </>
          ) : (
            <button
              onClick={props.onClose}
              className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${config.buttonColor}`}
            >
              {"buttonText" in props && props.buttonText ? props.buttonText : "OK"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
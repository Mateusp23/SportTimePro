type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
}

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

export default function Alert({ type, title, message, onClose, buttonText }: AlertProps) {
  const config = alertConfig[type];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="ml-3">
            <h3 className={`text-lg font-medium ${config.titleColor}`}>{title}</h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${config.buttonColor}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
} 
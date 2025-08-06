interface ValidationAlertProps {
  message: string;
  onClose: () => void;
}

export default function ValidationAlert({ message, onClose }: ValidationAlertProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Atenção</h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
} 
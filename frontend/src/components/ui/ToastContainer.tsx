import Toast, { ToastType } from "./Toast";

export interface ToastData {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-start px-4 py-6 sm:p-6 z-50"
    >
      <div className="flex w-full flex-col items-end space-y-4">
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            show={true}
            type={toast.type}
            message={toast.message}
            onClose={() => onDismiss(toast.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;

import { Fragment, useEffect } from "react";
import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type ToastType = "success" | "error";

interface ToastProps {
  show: boolean;
  type: ToastType;
  message: string;
  onClose: () => void;
  index: number;
}

const Toast = ({ show, type, message, onClose, index }: ToastProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000 + index * 1000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose, index]);

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`pointer-events-auto w-full max-w-md overflow-hidden rounded-xl shadow-xl ${
          type === "success"
            ? "bg-green-50 ring-1 ring-green-500/20"
            : "bg-red-50 ring-1 ring-red-500/20"
        }`}
      >
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {type === "success" ? (
                <CheckCircleIcon className="h-7 w-7 text-green-600" />
              ) : (
                <ExclamationCircleIcon className="h-7 w-7 text-red-600" />
              )}
            </div>
            <div className="ml-4 w-0 flex-1">
              <p
                className={`text-base font-medium ${
                  type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message}
              </p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className={`inline-flex rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  type === "success"
                    ? "text-green-600 hover:text-green-700 focus:ring-green-500"
                    : "text-red-600 hover:text-red-700 focus:ring-red-500"
                }`}
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default Toast;

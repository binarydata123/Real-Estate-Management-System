// import { toast, ToastContainer, ToastOptions } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';



// // Common default options
// const defaultOptions: ToastOptions = {
//   position: 'top-right',
//   autoClose: 3000,
//   hideProgressBar: false,
//   closeOnClick: true,
//   pauseOnHover: true,
//   draggable: true,
//   theme: 'colored',
// };

// // Helper to safely extract a message from different error shapes
// const getErrorMessage = (error: unknown): string => {
//   if (error instanceof Error) {
//     return error.message;
//   }

//   if (typeof error === 'string') {
//     return error;
//   }

//   if (
//     typeof error === 'object' &&
//     error !== null &&
//     'response' in error &&
//     typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
//   ) {
//     // Axios-style error
//     return (error as { response?: { data?: { message?: string } } }).response!.data!.message!;
//   }

//   if (
//     typeof error === 'object' &&
//     error !== null &&
//     'message' in error &&
//     typeof (error as { message?: string }).message === 'string'
//   ) {
//     // Generic object with message
//     return (error as { message: string }).message;
//   }

//   return 'An unknown error occurred';
// };

// // ✅ Error toast (accepts message + error + options)
// export const showErrorToast = (
//   message: string,
//   error?: unknown,
//   options?: ToastOptions,
// ): void => {
//   const fullMessage = error ? `${message} ${getErrorMessage(error)}` : message;
//   toast.error(fullMessage, { ...defaultOptions, ...options });
// };

// // ✅ Success toast
// export const showSuccessToast = (message: string, options?: ToastOptions): void => {
//   toast.success(message, { ...defaultOptions, ...options });
// };

// // ✅ Info toast
// export const showInfoToast = (message: string, options?: ToastOptions): void => {
//   toast.info(message, { ...defaultOptions, ...options });
// };

// // ✅ Warning toast
// export const showWarningToast = (message: string, options?: ToastOptions): void => {
//   toast.warn(message, { ...defaultOptions, ...options });
// };

// // ✅ Toast container (render once in root layout or App.tsx)
// export const AppToastContainer = () => <ToastContainer {...defaultOptions}/>;




import { toast, ToastContainer, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// GLOBAL FLAG to block toasts during forced logout
export let isForceLogout = false;
export const setForceLogoutFlag = (value: boolean) => {
  isForceLogout = value;
};

// Common default options
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
};

// Helper to extract message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    // Axios-style error
    return (error as { response?: { data?: { message?: string } } }).response!.data!.message!;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: string }).message === 'string'
  ) {
    // Generic object with message
    return (error as { message: string }).message;
  }

  return "An unknown error occurred";
};
// Block toast if force logout popup is visible
export const showErrorToast = (
  message: string,
  error?: unknown,
  options?: ToastOptions
): void => {
  if (isForceLogout) return; // BLOCK TOASTS
  const fullMessage = error ? `${message} ${getErrorMessage(error)}` : message;
  toast.error(fullMessage, { ...defaultOptions, ...options });
};

export const showSuccessToast = (
  message: string,
  options?: ToastOptions
): void => {
  if (isForceLogout) return;   //BLOCK TOASTS
  toast.success(message, { ...defaultOptions, ...options });
};

export const showInfoToast = (
  message: string,
  options?: ToastOptions
): void => {
  if (isForceLogout) return;   //BLOCK TOASTS
  toast.info(message, { ...defaultOptions, ...options });
};

export const showWarningToast = (
  message: string,
  options?: ToastOptions
): void => {
  if (isForceLogout) return;
  toast.warn(message, { ...defaultOptions, ...options });
};

// Toast container
export const AppToastContainer = () => <ToastContainer />;

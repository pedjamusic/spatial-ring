import { toastQueue } from "./toastQueue";

// Helper functions to show toasts

export const toast = {
  error: (message, options = {}) =>
    toastQueue.add({ message, variant: "error" }, { timeout: options.timeout ?? 5000 }),
  success: (message, options = {}) =>
    toastQueue.add({ message, variant: "success" }, { timeout: options.timeout ?? 5000 }),
  warning: (message, options = {}) =>
    toastQueue.add({ message, variant: "warning" }, { timeout: options.timeout ?? 5000 }),
  info: (message, options = {}) =>
    toastQueue.add({ message, variant: "info" }, { timeout: options.timeout ?? 5000 }),
};

// export const toast = {
//   success: (message, options = {}) => {
//     toastQueue.add(
//       {
//         message,
//         variant: "success",
//       },
//       { timeout: options.timeout || 5000 }
//     );
//   },

//   error: (message, options = {}) => {
//     toastQueue.add(
//       {
//         message,
//         variant: "error",
//       },
//       { timeout: options.timeout || 5000 }
//     );
//   },

//   warning: (message, options = {}) => {
//     toastQueue.add(
//       {
//         message,
//         variant: "warning",
//       },
//       { timeout: options.timeout || 5000 }
//     );
//   },

//   info: (message, options = {}) => {
//     toastQueue.add(
//       {
//         message,
//         variant: "info",
//       },
//       { timeout: options.timeout || 5000 }
//     );
//   },
// };

import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => {
    toast.success(message, {
      style: {
        borderRadius: '10px',
        background: '#10b981',
        color: '#fff',
      },
      duration: 3000,
    });
  },
  
  error: (message) => {
    toast.error(message, {
      style: {
        borderRadius: '10px',
        background: '#ef4444',
        color: '#fff',
      },
      duration: 4000,
    });
  },
  
  loading: (message) => {
    return toast.loading(message);
  },
  
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
  
  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    });
  },
};
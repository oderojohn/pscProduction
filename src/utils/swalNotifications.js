import Swal from 'sweetalert2';

export const showSuccess = (title, message) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    position: 'top-end',
    toast: true,
    background: '#d4edda',
    color: '#155724'
  });
};

export const showError = (title, message) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    timer: 5000,
    timerProgressBar: true,
    showConfirmButton: true,
    position: 'center',
    background: '#f8d7da',
    color: '#721c24'
  });
};

export const showWarning = (title, message) => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    timer: 4000,
    timerProgressBar: true,
    showConfirmButton: false,
    position: 'top-end',
    toast: true,
    background: '#fff3cd',
    color: '#856404'
  });
};

export const showInfo = (title, message) => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    position: 'top-end',
    toast: true,
    background: '#d1ecf1',
    color: '#0c5460'
  });
};
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Toàn cục chặn Fetch API để tự động nhét JWT Token vào mọi request
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const resource = args[0];
  const url = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : '');
  const isAuthRoute = url.includes('/api/auth/');

  if (!isAuthRoute) {
     const token = localStorage.getItem('hkpt_token');
     if (token) {
        if (!args[1]) args[1] = {};
        if (!args[1].headers) args[1].headers = {};
        // Nếu dùng FormData (upload file), không set Content-Type
        if (args[1].body instanceof FormData) {
           // Giữ nguyên headers, chỉ thêm auth
           // Fetch tự động set content-type là multipart/form-data kèm boundary
           args[1].headers = {
             ...args[1].headers,
             'Authorization': `Bearer ${token}`
           }
        } else {
           const isJson = args[1].body && typeof args[1].body === 'string';
           args[1].headers = {
             ...(isJson ? { 'Content-Type': 'application/json' } : {}),
             ...args[1].headers,
             'Authorization': `Bearer ${token}`
           }
        }
     }
  }

  const response = await originalFetch(...args);
  
  if ((response.status === 401 || response.status === 403) && !isAuthRoute) {
      localStorage.removeItem('hkpt_token');
      localStorage.removeItem('hkpt_user');
      window.dispatchEvent(new Event('auth-expired'));
  }

  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

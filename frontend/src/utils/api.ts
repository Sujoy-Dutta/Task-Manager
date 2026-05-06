import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10_000,
});

const PUBLIC_PATHS = ['/login', '/signup'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !PUBLIC_PATHS.includes(window.location.pathname)
    ) {

      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string })?.message;
    if (msg) return msg;
    if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
    if (!error.response) return 'Cannot reach the server. Is the backend running?';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

export default api;

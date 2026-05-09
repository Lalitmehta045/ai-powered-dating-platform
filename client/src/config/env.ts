export const env = {
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
};

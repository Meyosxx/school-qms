const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const apiBase = API_BASE;
export const apiUrl = (path) => {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};
export const uploadUrl = (filePath) => `${API_BASE}/uploads/${filePath}`;

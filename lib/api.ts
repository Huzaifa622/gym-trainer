import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
          Cookies.set('accessToken', data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const verifyOtp = (email: string, otp: string) =>
  api.post('/api/auth/verify-otp', { email, otp });

export const setPassword = (
  email: string,
  newPassword: string,
  confirmPassword: string,
  setupToken: string
) =>
  api.post(
    '/api/auth/set-password',
    { email, newPassword, confirmPassword },
    { headers: { Authorization: `Bearer ${setupToken}` } }
  );

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });

export const resendOtp = (email: string) =>
  api.post('/api/auth/resend-otp', { email });

export const logout = () => api.post('/api/auth/logout');

// Trainer
export const getProfile = () => api.get('/api/trainer/profile');
export const updateProfile = (data: object) => api.put('/api/trainer/profile', data);
export const uploadProfilePicture = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/api/trainer/profile/picture', form);
};
export const getClasses = () => api.get('/api/trainer/classes');
export const getTrainees = () => api.get('/api/trainer/trainees');
export const getSchedule = () => api.get('/api/trainer/schedule');

// Classes (shared)
export const createClass = (data: object) => api.post('/api/classes', data);
export const updateClass = (id: string, data: object) => api.put(`/api/classes/${id}`, data);
export const getClassEnrollments = (id: string) => api.get(`/api/classes/${id}/enrollments`);

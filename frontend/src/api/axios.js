import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response interceptor - log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

// Books
export const getBooks = (search = '') =>
  api.get(`/books${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const getBook = (id) => api.get(`/books/${id}`);
export const addBook = (data) => api.post('/books', data);
export const updateBook = (id, data) => api.put(`/books/${id}`, data);
export const deleteBook = (id) => api.delete(`/books/${id}`);

// Members
export const getMembers = (search = '') =>
  api.get(`/members${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const getMember = (id) => api.get(`/members/${id}`);
export const addMember = (data) => api.post('/members', data);
export const updateMember = (id, data) => api.put(`/members/${id}`, data);
export const deleteMember = (id) => api.delete(`/members/${id}`);

// Borrows
export const getBorrows = (params = {}) => api.get('/borrows', { params });
export const getOverdueBorrows = () => api.get('/borrows/overdue');
export const issueBook = (data) => api.post('/borrows/issue', data);
export const returnBook = (recordId) => api.put(`/borrows/return/${recordId}`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;

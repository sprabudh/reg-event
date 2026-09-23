import api from './api';

export const getCategories = () => api.get('/categories');
export const createCategory = (category) => api.post('/categories', category);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
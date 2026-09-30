import api from './api';
import { API_ENDPOINTS } from '../constants';

const { CATEGORIES } = API_ENDPOINTS;

export const getCategories = () => api.get(CATEGORIES.BASE);
export const createCategory = (category) => api.post(CATEGORIES.BASE, category);
export const deleteCategory = (id) => api.delete(CATEGORIES.BY_ID(id));

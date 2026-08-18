import axios from 'axios';

// This creates a base instance so we don't have to type localhost:8080 every time
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

export default api;
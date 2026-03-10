import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: 'http://localhost:8082/api', // Pointing exactly to the working Golang port from log
});

// Axios Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Axios Response Interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Check if error is 401 Unauthorized
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized access - removing token and redirecting");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // If we are not already on the login page, redirect
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

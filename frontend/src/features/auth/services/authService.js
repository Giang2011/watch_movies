import api from '@services/api';

export const authService = {
	signin: (payload) => api.post('/api/auth/signin', payload),
	signup: (payload) => api.post('/api/auth/signup', payload),
};

export default authService;

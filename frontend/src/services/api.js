import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY, USER_KEY } from '@utils/constants';

const PUBLIC_PATH_PREFIXES = ['/api/auth/', '/uploads/', '/swagger-ui/', '/api-docs/'];
const PUBLIC_GET_PATHS = new Set(['/api/movies', '/api/movies/search']);

const removeHeader = (headers, headerName) => {
	if (!headers) {
		return;
	}

	if (typeof headers.delete === 'function') {
		headers.delete(headerName);
		headers.delete(headerName.toLowerCase());
		return;
	}

	delete headers[headerName];
	delete headers[headerName.toLowerCase()];
};

const getRequestPath = (config) => {
	const requestUrl = config?.url || '';
	const baseUrl = config?.baseURL || API_BASE_URL;

	try {
		return new URL(requestUrl, baseUrl).pathname;
	} catch {
		return requestUrl;
	}
};

const isPublicRequest = (config) => {
	const method = (config?.method || 'get').toLowerCase();
	const path = getRequestPath(config);

	if (PUBLIC_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
		return true;
	}

	if (method === 'get' && PUBLIC_GET_PATHS.has(path)) {
		return true;
	}

	return false;
};

const api = axios.create({
	baseURL: API_BASE_URL,
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem(TOKEN_KEY);
		const isPublic = isPublicRequest(config);
		const method = (config?.method || 'get').toLowerCase();

		config.headers = config.headers || {};

		if (method === 'get') {
			removeHeader(config.headers, 'Content-Type');
		}

		if (token && !isPublic) {
			config.headers.Authorization = `Bearer ${token}`;
		} else {
			removeHeader(config.headers, 'Authorization');
		}

		return config;
	},
	(error) => Promise.reject(error)
);

api.interceptors.response.use(
	(response) => response,
	(error) => {
		const requestConfig = error?.config;
		const isPublic = isPublicRequest(requestConfig);

		if (error?.response?.status === 401 && !isPublic) {
			localStorage.removeItem(TOKEN_KEY);
			localStorage.removeItem(USER_KEY);
			if (window.location.pathname !== '/login') {
				window.location.href = '/login';
			}
		}

		return Promise.reject(error);
	}
);

export default api;

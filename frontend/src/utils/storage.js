import { TOKEN_KEY, USER_KEY } from './constants';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
	if (token) {
		localStorage.setItem(TOKEN_KEY, token);
	}
};

export const getUser = () => {
	const rawUser = localStorage.getItem(USER_KEY);
	if (!rawUser) {
		return null;
	}

	try {
		return JSON.parse(rawUser);
	} catch {
		return null;
	}
};

export const setUser = (user) => {
	localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeAuth = () => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
};

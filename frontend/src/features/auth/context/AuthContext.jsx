import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import authService from '../services/authService';
import { extractErrorMessage } from '@utils/helpers';
import { getToken, getUser, removeAuth, setToken, setUser } from '@utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [token, setTokenState] = useState(() => getToken());
	const [user, setUserState] = useState(() => getUser());
	const [isLoading, setIsLoading] = useState(false);

	const login = useCallback(async (credentials) => {
		setIsLoading(true);
		try {
			const { data } = await authService.signin(credentials);
			const mappedUser = {
				id: data.id,
				username: data.username,
				email: data.email,
				roles: data.roles || [],
			};

			setToken(data.token);
			setUser(mappedUser);

			setTokenState(data.token);
			setUserState(mappedUser);

			return data;
		} catch (error) {
			throw new Error(extractErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	}, []);

	const signup = useCallback(async (payload) => {
		setIsLoading(true);
		try {
			const { data } = await authService.signup(payload);
			return data;
		} catch (error) {
			throw new Error(extractErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	}, []);

	const logout = useCallback(() => {
		removeAuth();
		setTokenState(null);
		setUserState(null);
	}, []);

	const value = useMemo(() => {
		const isAuthenticated = Boolean(token);
		const roles = user?.roles || [];

		return {
			token,
			user,
			roles,
			isLoading,
			isAuthenticated,
			isAdmin: roles.includes('ROLE_ADMIN'),
			login,
			signup,
			logout,
		};
	}, [token, user, isLoading, login, signup, logout]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuthContext must be used within AuthProvider');
	}

	return context;
}

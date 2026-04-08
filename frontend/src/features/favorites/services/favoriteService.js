import api from '@services/api';

export const favoriteService = {
	getFavorites: () => api.get('/api/favorites'),
	addFavorite: (movieId) => api.post(`/api/favorites/${movieId}`),
	removeFavorite: (movieId) => api.delete(`/api/favorites/${movieId}`),
};

export default favoriteService;

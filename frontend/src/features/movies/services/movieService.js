import api from '@services/api';

export const movieService = {
	getMovies: (page = 0, size = 10) => api.get('/api/movies', { params: { page, size } }),
	searchMovies: (keyword) => api.get('/api/movies/search', { params: { keyword } }),
	addMovie: (formData) =>
		api.post('/api/movies', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		}),
	updateMovie: (id, formData) =>
		api.put(`/api/movies/${id}`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		}),
	deleteMovie: (id) => api.delete(`/api/movies/${id}`),
};

export default movieService;

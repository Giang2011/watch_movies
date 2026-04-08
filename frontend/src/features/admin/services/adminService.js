import movieService from '@features/movies/services/movieService';

export const adminService = {
	getMovies: movieService.getMovies,
	addMovie: movieService.addMovie,
	updateMovie: movieService.updateMovie,
	deleteMovie: movieService.deleteMovie,
};

export default adminService;

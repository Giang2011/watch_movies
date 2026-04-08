import { useCallback, useEffect, useState } from 'react';
import movieService from '../services/movieService';
import { extractErrorMessage } from '@utils/helpers';

const initialPagination = {
	totalElements: 0,
	totalPages: 0,
	number: 0,
	size: 10,
	first: true,
	last: true,
	empty: true,
};

const useMovies = ({ page = 0, size = 10 } = {}) => {
	const [movies, setMovies] = useState([]);
	const [pagination, setPagination] = useState(initialPagination);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	const fetchMovies = useCallback(async () => {
		setIsLoading(true);
		setErrorMessage('');

		try {
			const { data } = await movieService.getMovies(page, size);
			setMovies(data.content || []);
			setPagination({
				totalElements: data.totalElements,
				totalPages: data.totalPages,
				number: data.number,
				size: data.size,
				first: data.first,
				last: data.last,
				empty: data.empty,
			});
		} catch (error) {
			setMovies([]);
			setPagination(initialPagination);
			setErrorMessage(extractErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	}, [page, size]);

	useEffect(() => {
		fetchMovies();
	}, [fetchMovies]);

	return {
		movies,
		pagination,
		isLoading,
		errorMessage,
		isEmpty: !isLoading && movies.length === 0,
		refetchMovies: fetchMovies,
	};
};

export default useMovies;

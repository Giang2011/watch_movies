import { useCallback, useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';
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

const useAdminMovies = () => {
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [movies, setMovies] = useState([]);
	const [pagination, setPagination] = useState(initialPagination);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreatingMovie, setIsCreatingMovie] = useState(false);
	const [pendingUpdateMovieId, setPendingUpdateMovieId] = useState(null);
	const [pendingDeleteMovieIds, setPendingDeleteMovieIds] = useState(() => new Set());
	const [errorMessage, setErrorMessage] = useState('');

	const updatePendingDeleteState = useCallback((movieId, isPending) => {
		setPendingDeleteMovieIds((previousMovieIds) => {
			const nextMovieIds = new Set(previousMovieIds);

			if (isPending) {
				nextMovieIds.add(movieId);
			} else {
				nextMovieIds.delete(movieId);
			}

			return nextMovieIds;
		});
	}, []);

	const fetchMovies = useCallback(async () => {
		setIsLoading(true);
		setErrorMessage('');

		try {
			const { data } = await adminService.getMovies(page, size);
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

	const createMovie = useCallback(
		async (formData) => {
			setIsCreatingMovie(true);

			try {
				await adminService.addMovie(formData);

				if (page !== 0) {
					setPage(0);
					return;
				}

				await fetchMovies();
			} finally {
				setIsCreatingMovie(false);
			}
		},
		[fetchMovies, page]
	);

	const updateMovie = useCallback(
		async (movieId, formData) => {
			setPendingUpdateMovieId(movieId);

			try {
				await adminService.updateMovie(movieId, formData);
				await fetchMovies();
			} finally {
				setPendingUpdateMovieId(null);
			}
		},
		[fetchMovies]
	);

	const removeMovie = useCallback(
		async (movieId) => {
			updatePendingDeleteState(movieId, true);

			try {
				await adminService.deleteMovie(movieId);

				if (movies.length <= 1 && page > 0) {
					setPage((previousPage) => Math.max(0, previousPage - 1));
					return;
				}

				await fetchMovies();
			} finally {
				updatePendingDeleteState(movieId, false);
			}
		},
		[fetchMovies, movies.length, page, updatePendingDeleteState]
	);

	const isMutating = useMemo(() => {
		return isCreatingMovie || pendingUpdateMovieId !== null || pendingDeleteMovieIds.size > 0;
	}, [isCreatingMovie, pendingUpdateMovieId, pendingDeleteMovieIds]);

	return {
		page,
		size,
		setPage,
		setSize,
		movies,
		pagination,
		isLoading,
		isCreatingMovie,
		isUpdatingMovie: pendingUpdateMovieId !== null,
		isMutating,
		pendingUpdateMovieId,
		pendingDeleteMovieIds,
		errorMessage,
		fetchMovies,
		refetchMovies: fetchMovies,
		createMovie,
		updateMovie,
		removeMovie,
	};
};

export default useAdminMovies;

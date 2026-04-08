import { useCallback, useEffect, useMemo, useState } from 'react';
import favoriteService from '../services/favoriteService';
import { extractErrorMessage } from '@utils/helpers';

const useFavorites = ({ enabled = true } = {}) => {
	const [favorites, setFavorites] = useState([]);
	const [isLoading, setIsLoading] = useState(enabled);
	const [errorMessage, setErrorMessage] = useState('');
	const [pendingMovieIds, setPendingMovieIds] = useState(() => new Set());

	const updatePendingState = useCallback((movieId, isPending) => {
		setPendingMovieIds((previousMovieIds) => {
			const nextMovieIds = new Set(previousMovieIds);

			if (isPending) {
				nextMovieIds.add(movieId);
			} else {
				nextMovieIds.delete(movieId);
			}

			return nextMovieIds;
		});
	}, []);

	const fetchFavorites = useCallback(async () => {
		if (!enabled) {
			setFavorites([]);
			setErrorMessage('');
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setErrorMessage('');

		try {
			const { data } = await favoriteService.getFavorites();
			setFavorites(Array.isArray(data) ? data : []);
		} catch (error) {
			setFavorites([]);
			setErrorMessage(extractErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	}, [enabled]);

	useEffect(() => {
		if (!enabled) {
			setFavorites([]);
			setErrorMessage('');
			setIsLoading(false);
			return;
		}

		fetchFavorites();
	}, [enabled, fetchFavorites]);

	const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites]);

	const isFavorite = useCallback(
		(movieId) => {
			return favoriteIds.has(movieId);
		},
		[favoriteIds]
	);

	const addFavorite = useCallback(
		async (movieId) => {
			if (!enabled) {
				throw new Error('Please sign in to save favorites.');
			}

			updatePendingState(movieId, true);

			try {
				await favoriteService.addFavorite(movieId);
				await fetchFavorites();
			} finally {
				updatePendingState(movieId, false);
			}
		},
		[enabled, fetchFavorites, updatePendingState]
	);

	const removeFavorite = useCallback(
		async (movieId) => {
			if (!enabled) {
				throw new Error('Please sign in to save favorites.');
			}

			updatePendingState(movieId, true);

			try {
				await favoriteService.removeFavorite(movieId);
				setFavorites((previousFavorites) => previousFavorites.filter((movie) => movie.id !== movieId));
			} finally {
				updatePendingState(movieId, false);
			}
		},
		[enabled, updatePendingState]
	);

	const toggleFavorite = useCallback(
		async (movieId) => {
			if (isFavorite(movieId)) {
				await removeFavorite(movieId);
			} else {
				await addFavorite(movieId);
			}
		},
		[isFavorite, removeFavorite, addFavorite]
	);

	return {
		favorites,
		isLoading,
		errorMessage,
		pendingMovieIds,
		isEmpty: !isLoading && favorites.length === 0,
		isFavorite,
		addFavorite,
		removeFavorite,
		toggleFavorite,
		refetchFavorites: fetchFavorites,
	};
};

export default useFavorites;

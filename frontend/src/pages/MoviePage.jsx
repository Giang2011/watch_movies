import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '@components/UI/Spinner';
import ErrorMessage from '@components/UI/ErrorMessage';
import showToast from '@components/UI/Toast';
import { useAuth } from '@features/auth';
import { FavoriteButton, useFavorites } from '@features/favorites';
import { MovieDetail, VideoPlayer, useMovies } from '@features/movies';
import { extractErrorMessage } from '@utils/helpers';
import styles from './MoviePage.module.css';

function MoviePage() {
	const { id } = useParams();
	const { isAuthenticated } = useAuth();
	const {
		isFavorite,
		toggleFavorite,
		pendingMovieIds,
		isLoading: isFavoritesLoading,
	} = useFavorites({ enabled: isAuthenticated });
	const { movies, isLoading, errorMessage, refetchMovies } = useMovies({ page: 0, size: 100 });

	const movie = useMemo(() => {
		return movies.find((item) => item.id === Number(id));
	}, [movies, id]);

	const handleToggleFavorite = useCallback(async () => {
		if (!movie || !isAuthenticated) {
			return;
		}

		const wasFavorite = isFavorite(movie.id);

		try {
			await toggleFavorite(movie.id);
			showToast.success(wasFavorite ? 'Removed from favorites' : 'Added to favorites');
		} catch (error) {
			showToast.error(extractErrorMessage(error));
		}
	}, [isAuthenticated, isFavorite, movie, toggleFavorite]);

	if (isLoading) {
		return <Spinner label="Loading movie" />;
	}

	if (errorMessage) {
		return <ErrorMessage message={errorMessage} onRetry={refetchMovies} />;
	}

	if (!movie) {
		return <p className={styles.empty}>Movie not found.</p>;
	}

	const isFavoritePending = isFavoritesLoading || pendingMovieIds.has(movie.id);

	return (
		<section className={styles.page}>
			<div className={styles.detailSection}>
				<MovieDetail movie={movie} />
				{isAuthenticated ? (
					<div className={styles.favoriteAction}>
						<FavoriteButton
							isActive={isFavorite(movie.id)}
							onClick={handleToggleFavorite}
							isLoading={isFavoritePending}
							disabled={isFavoritePending}
						/>
					</div>
				) : null}
			</div>
			<VideoPlayer videoUrl={movie.videoUrl} />
		</section>
	);
}

export default MoviePage;

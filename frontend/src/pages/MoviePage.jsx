import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '@components/UI/Spinner';
import ErrorMessage from '@components/UI/ErrorMessage';
import { MovieDetail, VideoPlayer, useMovies } from '@features/movies';
import styles from './MoviePage.module.css';

function MoviePage() {
	const { id } = useParams();
	const { movies, isLoading, errorMessage, refetchMovies } = useMovies({ page: 0, size: 100 });

	const movie = useMemo(() => {
		return movies.find((item) => item.id === Number(id));
	}, [movies, id]);

	if (isLoading) {
		return <Spinner label="Loading movie" />;
	}

	if (errorMessage) {
		return <ErrorMessage message={errorMessage} onRetry={refetchMovies} />;
	}

	if (!movie) {
		return <p className={styles.empty}>Movie not found.</p>;
	}

	return (
		<section className={styles.page}>
			<MovieDetail movie={movie} />
			<VideoPlayer videoUrl={movie.videoUrl} />
		</section>
	);
}

export default MoviePage;

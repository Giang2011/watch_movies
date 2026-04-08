import MovieCard from './MovieCard';
import Spinner from '@components/UI/Spinner';
import ErrorMessage from '@components/UI/ErrorMessage';
import styles from './MovieGrid.module.css';

function MovieGrid({
	movies,
	isLoading,
	errorMessage,
	emptyMessage = 'No movies available.',
	onRetry,
	actionSlotBuilder,
}) {
	if (isLoading) {
		return <Spinner label="Loading movies" />;
	}

	if (errorMessage) {
		return <ErrorMessage message={errorMessage} onRetry={onRetry} />;
	}

	if (!movies.length) {
		return <p className={styles.empty}>{emptyMessage}</p>;
	}

	return (
		<section className={styles.grid}>
			{movies.map((movie) => (
				<MovieCard
					key={movie.id}
					movie={movie}
					actionSlot={actionSlotBuilder ? actionSlotBuilder(movie) : null}
				/>
			))}
		</section>
	);
}

export default MovieGrid;

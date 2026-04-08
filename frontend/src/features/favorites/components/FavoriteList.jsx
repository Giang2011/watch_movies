import MovieGrid from '@features/movies/components/MovieGrid';
import FavoriteButton from './FavoriteButton';
import styles from './FavoriteList.module.css';

const EMPTY_PENDING_MOVIES = new Set();

function FavoriteList({
	favorites,
	isLoading,
	errorMessage,
	onRetry,
	onRemove,
	emptyMessage = 'No favorite movies yet.',
	pendingMovieIds = EMPTY_PENDING_MOVIES,
}) {
	return (
		<div className={styles.listWrap}>
			<MovieGrid
				movies={favorites}
				isLoading={isLoading}
				errorMessage={errorMessage}
				emptyMessage={emptyMessage}
				onRetry={onRetry}
				actionSlotBuilder={(movie) => (
					<FavoriteButton
						isActive
						onClick={() => onRemove(movie.id)}
						isLoading={pendingMovieIds.has(movie.id)}
						disabled={pendingMovieIds.has(movie.id)}
					/>
				)}
			/>
		</div>
	);
}

export default FavoriteList;

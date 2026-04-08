import MovieCard from './MovieCard';
import styles from './MovieRow.module.css';

function MovieRow({ title, movies, enableCinematic = false, rowIndex = 0, actionSlotBuilder }) {
	if (!movies.length) {
		return null;
	}

	return (
		<section
			className={`${styles.rowWrap} ${enableCinematic ? styles.cinematicRow : ''}`}
			style={enableCinematic ? { '--row-index': rowIndex } : undefined}
		>
			<h2>{title}</h2>
			<div className={styles.row}>
				{movies.map((movie, movieIndex) => (
					<div
						key={movie.id}
						className={`${styles.item} ${enableCinematic ? styles.cinematicItem : ''}`}
						style={enableCinematic ? { '--item-index': movieIndex } : undefined}
					>
						<MovieCard
							movie={movie}
							actionSlot={actionSlotBuilder ? actionSlotBuilder(movie) : null}
						/>
					</div>
				))}
			</div>
		</section>
	);
}

export default MovieRow;

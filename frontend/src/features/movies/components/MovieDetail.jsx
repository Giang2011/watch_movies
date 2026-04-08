import { formatYear } from '@utils/helpers';
import styles from './MovieDetail.module.css';

function MovieDetail({ movie }) {
	if (!movie) {
		return null;
	}

	return (
		<section className={styles.detail}>
			<h1>{movie.title}</h1>
			<p className={styles.year}>{formatYear(movie.releaseYear)}</p>
			<p className={styles.description}>{movie.description}</p>
		</section>
	);
}

export default MovieDetail;

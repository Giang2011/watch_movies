import { Link } from 'react-router-dom';
import fallbackThumbnail from '@assets/images/fallback-thumbnail.jpg';
import { getFullMediaUrl, formatYear } from '@utils/helpers';
import styles from './MovieCard.module.css';

function MovieCard({ movie, actionSlot = null }) {
	const thumbnailUrl = getFullMediaUrl(movie.thumbnailUrl);

	const handleMouseMove = (event) => {
		const card = event.currentTarget;
		const rect = card.getBoundingClientRect();
		const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
		const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

		card.style.setProperty('--card-rotate-x', `${(-normalizedY * 5).toFixed(2)}deg`);
		card.style.setProperty('--card-rotate-y', `${(normalizedX * 7).toFixed(2)}deg`);
		card.style.setProperty('--card-shine-x', `${((normalizedX + 0.5) * 100).toFixed(1)}%`);
		card.style.setProperty('--card-shine-y', `${((normalizedY + 0.5) * 100).toFixed(1)}%`);
	};

	const handleMouseLeave = (event) => {
		event.currentTarget.style.setProperty('--card-rotate-x', '0deg');
		event.currentTarget.style.setProperty('--card-rotate-y', '0deg');
		event.currentTarget.style.setProperty('--card-shine-x', '50%');
		event.currentTarget.style.setProperty('--card-shine-y', '50%');
	};

	return (
		<article className={styles.card} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
			<Link to={`/movie/${movie.id}`} className={styles.thumbnailLink}>
				<img
					src={thumbnailUrl || fallbackThumbnail}
					alt={movie.title}
					loading="lazy"
					className={styles.thumbnail}
					onError={(event) => {
						event.currentTarget.src = fallbackThumbnail;
					}}
				/>
			</Link>
			<div className={styles.meta}>
				<h3 className={styles.title}>{movie.title}</h3>
				<p className={styles.year}>{formatYear(movie.releaseYear)}</p>
			</div>
			{actionSlot ? <div className={styles.actions}>{actionSlot}</div> : null}
		</article>
	);
}

export default MovieCard;

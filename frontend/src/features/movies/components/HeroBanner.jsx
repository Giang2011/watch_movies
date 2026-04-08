import { Link } from 'react-router-dom';
import Button from '@components/UI/Button';
import fallbackThumbnail from '@assets/images/hero-bg.jpg';
import { getFullMediaUrl } from '@utils/helpers';
import styles from './HeroBanner.module.css';

function HeroBanner({ movie }) {
	if (!movie) {
		return null;
	}

	const backgroundImage = getFullMediaUrl(movie.thumbnailUrl) || fallbackThumbnail;

	return (
		<section className={styles.banner}>
			<img src={backgroundImage} alt={movie.title} className={styles.background} />
			<div className={styles.overlay} />
			<div className={styles.content}>
				<h1>{movie.title}</h1>
				<p>{movie.description}</p>
				<Link to={`/movie/${movie.id}`}>
					<Button>Watch now</Button>
				</Link>
			</div>
		</section>
	);
}

export default HeroBanner;

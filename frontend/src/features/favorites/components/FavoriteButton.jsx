import { FaHeart, FaRegHeart, FaSpinner } from 'react-icons/fa';
import styles from './FavoriteButton.module.css';

function FavoriteButton({ isActive, onClick, isLoading = false, disabled = false }) {
	const isDisabled = disabled || isLoading;
	const label = isLoading ? 'Removing...' : isActive ? 'Favorited' : 'Add to favorites';

	return (
		<button
			type="button"
			className={styles.button}
			onClick={onClick}
			disabled={isDisabled}
			aria-pressed={isActive}
			aria-busy={isLoading}
		>
			{isLoading ? (
				<FaSpinner className={styles.spinner} aria-hidden />
			) : isActive ? (
				<FaHeart className={styles.active} aria-hidden />
			) : (
				<FaRegHeart aria-hidden />
			)}
			{label}
		</button>
	);
}

export default FavoriteButton;

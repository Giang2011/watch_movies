import styles from './Button.module.css';

function Button({
	type = 'button',
	variant = 'primary',
	isLoading = false,
	disabled = false,
	onClick,
	children,
}) {
	return (
		<button
			type={type}
			className={`${styles.button} ${styles[variant] || styles.primary}`}
			disabled={disabled || isLoading}
			onClick={onClick}
		>
			{isLoading ? 'Please wait...' : children}
		</button>
	);
}

export default Button;

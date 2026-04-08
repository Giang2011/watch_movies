import styles from './Footer.module.css';

function Footer() {
	return (
		<footer className={styles.footer}>
			<p>Netflix Clone Frontend</p>
			<p className={styles.meta}>React + Vite + Spring Boot API</p>
		</footer>
	);
}

export default Footer;

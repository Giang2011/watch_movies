import styles from './Footer.module.css';

function Footer() {
	return (
		<footer className={styles.footer}>
			<p>WATCH!</p>
			<p>&copy; {new Date().getFullYear()} WATCH!. All rights reserved.</p>
		</footer>
	);
}

export default Footer;

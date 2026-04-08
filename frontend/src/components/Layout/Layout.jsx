import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from './Layout.module.css';

function Layout() {
	return (
		<div className={styles.layout}>
			<Navbar />
			<main className={styles.mainContent}>
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}

export default Layout;

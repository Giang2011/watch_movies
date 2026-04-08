import { NavLink } from 'react-router-dom';
import styles from './AdminSidebar.module.css';

function AdminSidebar() {
	return (
		<aside className={styles.sidebar}>
			<h3>Admin Console</h3>
			<p>Catalog operations require ROLE_ADMIN and authenticated JWT token.</p>

			<nav className={styles.nav}>
				<NavLink
					to="/admin"
					className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
				>
					Movie Management
				</NavLink>
				<NavLink
					to="/browse"
					className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
				>
					Browse Catalog
				</NavLink>
				<NavLink
					to="/favorites"
					className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
				>
					User Favorites
				</NavLink>
			</nav>

			<ul className={styles.tips}>
				<li>Create movie: title, description, year, thumbnail, video.</li>
				<li>Edit movie: media files are optional.</li>
				<li>Delete movie: permanently removes record and files.</li>
			</ul>
		</aside>
	);
}

export default AdminSidebar;

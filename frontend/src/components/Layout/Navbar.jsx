import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaHeart, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@features/auth';
import styles from './Navbar.module.css';

function Navbar() {
	const { user, isAuthenticated, isAdmin, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<header className={styles.navbar}>
			<div className={styles.brandArea}>
				<Link to="/" className={styles.logo}>
					WATCH!
				</Link>
				<nav className={styles.navLinks}>
					<NavLink
						to="/"
						className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
					>
						Home
					</NavLink>
					<NavLink
						to="/browse"
						className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
					>
						Browse
					</NavLink>
					{isAuthenticated ? (
						<NavLink
							to="/favorites"
							className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
						>
							Favorites
						</NavLink>
					) : null}
					{isAdmin ? (
						<NavLink
							to="/admin"
							className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
						>
							Admin
						</NavLink>
					) : null}
				</nav>
			</div>

			<div className={styles.accountArea}>
				{isAuthenticated ? (
					<>
						<span className={styles.userChip}>
							<FaUserCircle aria-hidden /> {user?.username}
						</span>
						<button type="button" className={styles.logoutButton} onClick={handleLogout}>
							<FaSignOutAlt aria-hidden /> Logout
						</button>
					</>
				) : (
					<Link to="/login" className={styles.loginButton}>
						Login
					</Link>
				)}
			</div>
		</header>
	);
}

export default Navbar;

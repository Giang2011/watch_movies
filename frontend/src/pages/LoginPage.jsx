import { Link, Navigate } from 'react-router-dom';
import { LoginForm, useAuth } from '@features/auth';
import styles from './LoginPage.module.css';

function LoginPage() {
	const { isAuthenticated } = useAuth();

	if (isAuthenticated) {
		return <Navigate to="/browse" replace />;
	}

	return (
		<div className={styles.page}>
			<section className={styles.shell}>
				<div className={styles.brandPanel}>
					<h1>WATCH!</h1>
					<p>Welcome back. Sign in to continue your personal streaming experience.</p>
					<ul className={styles.featureList}>
						<li>Fast movie browsing</li>
						<li>Personal favorite list</li>
						<li>Role-based access</li>
					</ul>
				</div>

				<div className={styles.formPanel}>
					<LoginForm />
					<p className={styles.meta}>
						Need an account? <Link to="/signup">Sign up</Link>
					</p>
				</div>
			</section>
		</div>
	);
}

export default LoginPage;

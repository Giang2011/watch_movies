import { Link, Navigate } from 'react-router-dom';
import { SignupForm, useAuth } from '@features/auth';
import styles from './SignupPage.module.css';

function SignupPage() {
	const { isAuthenticated } = useAuth();

	if (isAuthenticated) {
		return <Navigate to="/browse" replace />;
	}

	return (
		<div className={styles.page}>
			<section className={styles.shell}>
				<div className={styles.brandPanel}>
					<h1>Join NETFLIX</h1>
					<p>Create your account in seconds and unlock your personalized watch flow.</p>
					<ul className={styles.featureList}>
						<li>Secure JWT login</li>
						<li>Save favorites instantly</li>
						<li>Responsive viewing experience</li>
					</ul>
				</div>

				<div className={styles.formPanel}>
					<SignupForm />
					<p className={styles.meta}>
						Already registered? <Link to="/login">Login</Link>
					</p>
				</div>
			</section>
		</div>
	);
}

export default SignupPage;

import { Link } from 'react-router-dom';

function NotFoundPage() {
	return (
		<section>
			<h1>404 - Page not found</h1>
			<p>The page does not exist.</p>
			<Link to="/">Go to home</Link>
		</section>
	);
}

export default NotFoundPage;

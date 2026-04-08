import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from '@components/Layout/Layout';
import PrivateRoute from '@components/PrivateRoute';
import AdminRoute from '@components/AdminRoute';
import Spinner from '@components/UI/Spinner';
import styles from './App.module.css';

const HomePage = lazy(() => import('@pages/HomePage'));
const LoginPage = lazy(() => import('@pages/LoginPage'));
const SignupPage = lazy(() => import('@pages/SignupPage'));
const BrowsePage = lazy(() => import('@pages/BrowsePage'));
const MoviePage = lazy(() => import('@pages/MoviePage'));
const FavoritesPage = lazy(() => import('@pages/FavoritesPage'));
const AdminDashboard = lazy(() => import('@pages/AdminDashboard'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));

function App() {
	return (
		<div className={styles.app}>
			<Suspense fallback={<Spinner fullscreen label="Loading page" />}>
				<Routes>
					<Route element={<Layout />}>
						<Route path="/" element={<HomePage />} />
						<Route path="/browse" element={<BrowsePage />} />
						<Route path="/movie/:id" element={<MoviePage />} />
					</Route>

					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />

					<Route element={<Layout />}>
						<Route element={<PrivateRoute />}>
							<Route path="/favorites" element={<FavoritesPage />} />
						</Route>
					</Route>

					<Route element={<Layout />}>
						<Route element={<AdminRoute />}>
							<Route path="/admin" element={<AdminDashboard />} />
						</Route>
					</Route>

					<Route path="/home" element={<Navigate to="/" replace />} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</Suspense>

			<ToastContainer
				position="bottom-right"
				autoClose={4000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="dark"
			/>
		</div>
	);
}

export default App;

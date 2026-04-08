import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@features/auth';

function AdminRoute() {
	const { isAuthenticated, isAdmin } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (!isAdmin) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}

export default AdminRoute;

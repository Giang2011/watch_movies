import { API_BASE_URL } from './constants';

export const getFullMediaUrl = (path) => {
	if (!path) {
		return '';
	}

	if (path.startsWith('http://') || path.startsWith('https://')) {
		return path;
	}

	return `${API_BASE_URL}${path}`;
};

export const formatYear = (year) => {
	const parsedYear = Number(year);
	return Number.isFinite(parsedYear) ? parsedYear : 'N/A';
};

export const extractErrorMessage = (error) => {
	return (
		error?.response?.data?.message ||
		error?.message ||
		'Something went wrong. Please try again.'
	);
};

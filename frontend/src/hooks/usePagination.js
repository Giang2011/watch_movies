import { useMemo, useState } from 'react';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@utils/constants';

const usePagination = (initialPage = DEFAULT_PAGE, initialSize = DEFAULT_PAGE_SIZE) => {
	const [page, setPage] = useState(initialPage);
	const [size, setSize] = useState(initialSize);

	const resetPagination = () => {
		setPage(DEFAULT_PAGE);
		setSize(DEFAULT_PAGE_SIZE);
	};

	const nextPage = () => {
		setPage((prevPage) => prevPage + 1);
	};

	const prevPage = () => {
		setPage((prevPage) => Math.max(DEFAULT_PAGE, prevPage - 1));
	};

	const paginationParams = useMemo(() => ({ page, size }), [page, size]);

	return {
		page,
		size,
		setPage,
		setSize,
		resetPagination,
		nextPage,
		prevPage,
		paginationParams,
	};
};

export default usePagination;

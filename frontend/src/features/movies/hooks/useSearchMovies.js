import { useCallback, useEffect, useMemo, useState } from 'react';
import movieService from '../services/movieService';
import { extractErrorMessage } from '@utils/helpers';
import useDebounce from '@hooks/useDebounce';

const useSearchMovies = (movies = [], options = {}) => {
	const { keyword: controlledKeyword, onKeywordChange } = options;
	const [uncontrolledKeyword, setUncontrolledKeyword] = useState('');
	const keyword = controlledKeyword ?? uncontrolledKeyword;
	const [searchIds, setSearchIds] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchErrorMessage, setSearchErrorMessage] = useState('');
	const debouncedKeyword = useDebounce(keyword, 400);

	const setKeyword = useCallback(
		(nextKeyword) => {
			const resolvedKeyword = typeof nextKeyword === 'function' ? nextKeyword(keyword) : nextKeyword;

			if (typeof onKeywordChange === 'function') {
				onKeywordChange(resolvedKeyword);
			}

			if (controlledKeyword === undefined) {
				setUncontrolledKeyword(resolvedKeyword);
			}
		},
		[keyword, onKeywordChange, controlledKeyword]
	);

	useEffect(() => {
		const runSearch = async () => {
			const trimmedKeyword = debouncedKeyword.trim();
			if (!trimmedKeyword) {
				setSearchIds([]);
				setSearchErrorMessage('');
				return;
			}

			setIsSearching(true);
			setSearchErrorMessage('');

			try {
				const { data } = await movieService.searchMovies(trimmedKeyword);
				setSearchIds(Array.isArray(data) ? data : []);
			} catch (error) {
				setSearchIds([]);
				setSearchErrorMessage(extractErrorMessage(error));
			} finally {
				setIsSearching(false);
			}
		};

		runSearch();
	}, [debouncedKeyword]);

	const filteredMovies = useMemo(() => {
		if (!debouncedKeyword.trim()) {
			return movies;
		}

		return movies.filter((movie) => searchIds.includes(movie.id));
	}, [movies, searchIds, debouncedKeyword]);

	return {
		keyword,
		setKeyword,
		filteredMovies,
		isSearching,
		searchErrorMessage,
		isSearchActive: Boolean(debouncedKeyword.trim()),
	};
};

export default useSearchMovies;

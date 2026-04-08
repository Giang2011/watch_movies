import { useEffect, useMemo, useState } from 'react';
import Button from '@components/UI/Button';
import showToast from '@components/UI/Toast';
import { FavoriteList, useFavorites } from '@features/favorites';
import { SearchBar } from '@features/movies';
import { useAuth } from '@features/auth';
import useDebounce from '@hooks/useDebounce';
import { extractErrorMessage } from '@utils/helpers';
import styles from './FavoritesPage.module.css';

const SORT_OPTIONS = {
	TITLE_ASC: 'title-asc',
	TITLE_DESC: 'title-desc',
	YEAR_DESC: 'year-desc',
	YEAR_ASC: 'year-asc',
};

const DEFAULT_SORT = SORT_OPTIONS.TITLE_ASC;
const PAGE_SIZE_OPTIONS = [6, 12, 18, 24];
const DEFAULT_PAGE_SIZE = 12;

const parseYearValue = (value) => {
	if (value === '') {
		return '';
	}

	const parsedValue = Number(value);
	if (!Number.isFinite(parsedValue)) {
		return '';
	}

	return String(Math.max(0, Math.trunc(parsedValue)));
};

function FavoritesPage() {
	const { user } = useAuth();
	const { favorites, isLoading, errorMessage, refetchFavorites, removeFavorite, pendingMovieIds } =
		useFavorites();
	const [keyword, setKeyword] = useState('');
	const [sortOption, setSortOption] = useState(DEFAULT_SORT);
	const [yearMinInput, setYearMinInput] = useState('');
	const [yearMaxInput, setYearMaxInput] = useState('');
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [currentPage, setCurrentPage] = useState(1);
	const debouncedKeyword = useDebounce(keyword, 280);

	const normalizedKeyword = debouncedKeyword.trim().toLowerCase();
	const availableYears = useMemo(() => {
		return favorites
			.map((movie) => Number(movie.releaseYear))
			.filter((releaseYear) => Number.isFinite(releaseYear));
	}, [favorites]);

	const yearBounds = useMemo(() => {
		if (!availableYears.length) {
			return {
				minAvailableYear: null,
				maxAvailableYear: null,
			};
		}

		return {
			minAvailableYear: Math.min(...availableYears),
			maxAvailableYear: Math.max(...availableYears),
		};
	}, [availableYears]);

	const { minAvailableYear, maxAvailableYear } = yearBounds;
	const hasYearFilter = yearMinInput !== '' || yearMaxInput !== '';

	const filteredFavorites = useMemo(() => {
		if (!normalizedKeyword) {
			return favorites;
		}

		return favorites.filter((movie) => {
			const normalizedTitle = String(movie.title || '').toLowerCase();
			const normalizedDescription = String(movie.description || '').toLowerCase();

			return (
				normalizedTitle.includes(normalizedKeyword) ||
				normalizedDescription.includes(normalizedKeyword)
			);
		});
	}, [favorites, normalizedKeyword]);

	const yearFilteredFavorites = useMemo(() => {
		if (!hasYearFilter || minAvailableYear === null || maxAvailableYear === null) {
			return filteredFavorites;
		}

		const requestedMin = yearMinInput === '' ? minAvailableYear : Number(yearMinInput);
		const requestedMax = yearMaxInput === '' ? maxAvailableYear : Number(yearMaxInput);

		const rangeMin = Math.min(requestedMin, requestedMax);
		const rangeMax = Math.max(requestedMin, requestedMax);

		return filteredFavorites.filter((movie) => {
			const releaseYear = Number(movie.releaseYear);

			if (!Number.isFinite(releaseYear)) {
				return false;
			}

			return releaseYear >= rangeMin && releaseYear <= rangeMax;
		});
	}, [
		filteredFavorites,
		hasYearFilter,
		yearMinInput,
		yearMaxInput,
		minAvailableYear,
		maxAvailableYear,
	]);

	const displayFavorites = useMemo(() => {
		const sortedFavorites = [...yearFilteredFavorites];

		switch (sortOption) {
			case SORT_OPTIONS.TITLE_DESC:
				sortedFavorites.sort((firstMovie, secondMovie) =>
					String(secondMovie.title || '').localeCompare(String(firstMovie.title || ''))
				);
				break;
			case SORT_OPTIONS.YEAR_DESC:
				sortedFavorites.sort(
					(firstMovie, secondMovie) => Number(secondMovie.releaseYear) - Number(firstMovie.releaseYear)
				);
				break;
			case SORT_OPTIONS.YEAR_ASC:
				sortedFavorites.sort(
					(firstMovie, secondMovie) => Number(firstMovie.releaseYear) - Number(secondMovie.releaseYear)
				);
				break;
			case SORT_OPTIONS.TITLE_ASC:
			default:
				sortedFavorites.sort((firstMovie, secondMovie) =>
					String(firstMovie.title || '').localeCompare(String(secondMovie.title || ''))
				);
				break;
		}

		return sortedFavorites;
	}, [yearFilteredFavorites, sortOption]);

	const totalFilteredFavorites = displayFavorites.length;
	const totalPages = Math.max(1, Math.ceil(totalFilteredFavorites / pageSize));

	useEffect(() => {
		setCurrentPage(1);
	}, [normalizedKeyword, yearMinInput, yearMaxInput, pageSize]);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const rangeStartIndex = totalFilteredFavorites === 0 ? 0 : (currentPage - 1) * pageSize;
	const rangeEndIndex = Math.min(rangeStartIndex + pageSize, totalFilteredFavorites);

	const paginatedFavorites = useMemo(() => {
		if (!totalFilteredFavorites) {
			return [];
		}

		return displayFavorites.slice(rangeStartIndex, rangeEndIndex);
	}, [displayFavorites, rangeStartIndex, rangeEndIndex, totalFilteredFavorites]);

	const latestReleaseYear = useMemo(() => {
		if (!favorites.length) {
			return 'N/A';
		}

		const releaseYears = favorites
			.map((movie) => Number(movie.releaseYear))
			.filter((releaseYear) => Number.isFinite(releaseYear));

		if (!releaseYears.length) {
			return 'N/A';
		}

		return Math.max(...releaseYears);
	}, [favorites]);

	const yearRangeLabel =
		minAvailableYear !== null && maxAvailableYear !== null
			? `${minAvailableYear} - ${maxAvailableYear}`
			: 'N/A';

	const isFilterActive = Boolean(normalizedKeyword) || hasYearFilter;

	const emptyMessage = isFilterActive
		? 'No favorites match your current search/year filters.'
		: 'No favorite movies yet. Browse titles and tap Add to favorites to build your watchlist.';

	const isPaginationDisabled = isLoading || totalFilteredFavorites === 0;

	const handleResetYearFilter = () => {
		setYearMinInput('');
		setYearMaxInput('');
	};

	const handleRemove = async (movieId) => {
		try {
			await removeFavorite(movieId);
			showToast.success('Removed from favorites');
		} catch (error) {
			showToast.error(extractErrorMessage(error));
		}
	};

	return (
		<section className={styles.page}>
			<header className={styles.header}>
				<div>
					<h1>My Favorites</h1>
					<p>
						{user?.username
							? `Welcome back, ${user.username}. Manage your saved titles in one place.`
							: 'Manage your saved titles in one place.'}
					</p>
				</div>

				<div className={styles.metaChips}>
					<span>
						Saved: <strong>{favorites.length}</strong>
					</span>
					<span>
						Showing: <strong>{displayFavorites.length}</strong>
					</span>
					<span>
						Latest release: <strong>{latestReleaseYear}</strong>
					</span>
				</div>
			</header>

			<div className={styles.controlPanel}>
				<div className={styles.searchColumn}>
					<SearchBar
						keyword={keyword}
						onKeywordChange={setKeyword}
						showClearButton
						onClear={() => setKeyword('')}
					/>

					<div className={styles.yearFilter}>
						<div className={styles.yearFilterHead}>
							<p>Release year range</p>
							<span>Catalog: {yearRangeLabel}</span>
						</div>

						<div className={styles.yearInputs}>
							<label className={styles.selectField}>
								<span>From</span>
								<input
									type="number"
									min={minAvailableYear ?? undefined}
									max={maxAvailableYear ?? undefined}
									value={yearMinInput}
									onChange={(event) => setYearMinInput(parseYearValue(event.target.value))}
									placeholder={
										minAvailableYear !== null ? String(minAvailableYear) : 'Min year'
									}
								/>
							</label>

							<label className={styles.selectField}>
								<span>To</span>
								<input
									type="number"
									min={minAvailableYear ?? undefined}
									max={maxAvailableYear ?? undefined}
									value={yearMaxInput}
									onChange={(event) => setYearMaxInput(parseYearValue(event.target.value))}
									placeholder={
										maxAvailableYear !== null ? String(maxAvailableYear) : 'Max year'
									}
								/>
							</label>
						</div>

						{hasYearFilter ? (
							<Button variant="ghost" onClick={handleResetYearFilter}>
								Reset year filter
							</Button>
						) : null}
					</div>
				</div>

				<div className={styles.actions}>
					<label className={styles.selectField}>
						<span>Sort by</span>
						<select value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
							<option value={SORT_OPTIONS.TITLE_ASC}>Title: A-Z</option>
							<option value={SORT_OPTIONS.TITLE_DESC}>Title: Z-A</option>
							<option value={SORT_OPTIONS.YEAR_DESC}>Release year: newest</option>
							<option value={SORT_OPTIONS.YEAR_ASC}>Release year: oldest</option>
						</select>
					</label>

					<label className={styles.selectField}>
						<span>Items per page</span>
						<select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
							{PAGE_SIZE_OPTIONS.map((sizeOption) => (
								<option key={sizeOption} value={sizeOption}>
									{sizeOption} / page
								</option>
							))}
						</select>
					</label>

					<Button variant="secondary" onClick={refetchFavorites} disabled={isLoading}>
						Refresh list
					</Button>
				</div>
			</div>

			<FavoriteList
				favorites={paginatedFavorites}
				isLoading={isLoading}
				errorMessage={errorMessage}
				onRetry={refetchFavorites}
				onRemove={handleRemove}
				emptyMessage={emptyMessage}
				pendingMovieIds={pendingMovieIds}
			/>

			<div className={styles.pagination}>
				<div className={styles.paginationMeta}>
					Filtered: <strong>{totalFilteredFavorites}</strong>
					<span>
						Showing <strong>{totalFilteredFavorites ? rangeStartIndex + 1 : 0}</strong>-
						<strong>{rangeEndIndex}</strong>
					</span>
				</div>

				<div className={styles.paginationControls}>
					<Button
						variant="ghost"
						onClick={() => setCurrentPage(1)}
						disabled={isPaginationDisabled || currentPage === 1}
					>
						First
					</Button>
					<Button
						variant="secondary"
						onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
						disabled={isPaginationDisabled || currentPage === 1}
					>
						Previous
					</Button>

					<span className={styles.pageIndicator}>
						Page {currentPage} / {totalPages}
					</span>

					<Button
						variant="secondary"
						onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
						disabled={isPaginationDisabled || currentPage >= totalPages}
					>
						Next
					</Button>
					<Button
						variant="ghost"
						onClick={() => setCurrentPage(totalPages)}
						disabled={isPaginationDisabled || currentPage >= totalPages}
					>
						Last
					</Button>
				</div>
			</div>
		</section>
	);
}

export default FavoritesPage;

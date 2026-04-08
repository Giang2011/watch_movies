import { MovieGrid, SearchBar, useMovies, useSearchMovies } from '@features/movies';
import Button from '@components/UI/Button';
import { useCallback, useMemo } from 'react';
import Skeleton from '@components/UI/Skeleton';
import showToast from '@components/UI/Toast';
import { FavoriteButton, useFavorites } from '@features/favorites';
import { useAuth } from '@features/auth';
import { extractErrorMessage } from '@utils/helpers';
import { useSearchParams } from 'react-router-dom';
import styles from './BrowsePage.module.css';

const PAGE_SIZE_OPTIONS = [8, 12, 16, 20];
const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 12;

const SORT_OPTIONS = {
	TITLE_ASC: 'title-asc',
	YEAR_DESC: 'year-desc',
	YEAR_ASC: 'year-asc',
};

const DEFAULT_SORT = SORT_OPTIONS.YEAR_DESC;

const isValidNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;

function BrowseGridSkeleton({ count }) {
	return (
		<section className={styles.skeletonGrid} aria-label="Loading browse movies">
			{Array.from({ length: count }).map((_, index) => (
				<article key={`browse-skeleton-${index}`} className={styles.skeletonCard}>
					<Skeleton variant="card" />
					<div className={styles.skeletonMeta}>
						<Skeleton variant="line" />
						<Skeleton variant="line" />
					</div>
				</article>
			))}
		</section>
	);
}

function BrowsePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const { isAuthenticated } = useAuth();

	const pageParam = Number(searchParams.get('page'));
	const sizeParam = Number(searchParams.get('size'));
	const sortParam = searchParams.get('sort');
	const keywordParam = searchParams.get('keyword') || '';

	const page = isValidNonNegativeInteger(pageParam) ? pageParam : DEFAULT_PAGE;
	const size = PAGE_SIZE_OPTIONS.includes(sizeParam) ? sizeParam : DEFAULT_SIZE;
	const sortOption = Object.values(SORT_OPTIONS).includes(sortParam) ? sortParam : DEFAULT_SORT;

	const syncQueryState = (updates, options = {}) => {
		const { replace = false } = options;
		const nextParams = new URLSearchParams(searchParams);

		Object.entries(updates).forEach(([key, value]) => {
			const isEmptyKeyword = key === 'keyword' && !String(value || '').trim();
			const isDefaultPage = key === 'page' && Number(value) === DEFAULT_PAGE;
			const isDefaultSize = key === 'size' && Number(value) === DEFAULT_SIZE;
			const isDefaultSort = key === 'sort' && value === DEFAULT_SORT;

			if (value === undefined || value === null || isEmptyKeyword || isDefaultPage || isDefaultSize || isDefaultSort) {
				nextParams.delete(key);
				return;
			}

			nextParams.set(key, String(value));
		});

		if (nextParams.toString() !== searchParams.toString()) {
			setSearchParams(nextParams, { replace });
		}
	};

	const { movies, pagination, isLoading, errorMessage, refetchMovies } = useMovies({
		page,
		size,
	});
	const {
		isFavorite,
		toggleFavorite,
		pendingMovieIds,
		isLoading: isFavoritesLoading,
	} = useFavorites({ enabled: isAuthenticated });
	const { filteredMovies, isSearching, searchErrorMessage, isSearchActive } = useSearchMovies(movies, {
		keyword: keywordParam,
		onKeywordChange: (nextKeyword) =>
			syncQueryState(
				{
					keyword: nextKeyword,
					page: DEFAULT_PAGE,
				},
				{ replace: true }
			),
	});

	const sourceMovies = useMemo(() => {
		if (isSearchActive && !searchErrorMessage) {
			return filteredMovies;
		}

		return movies;
	}, [isSearchActive, searchErrorMessage, filteredMovies, movies]);

	const displayMovies = useMemo(() => {
		const sortedMovies = [...sourceMovies];

		switch (sortOption) {
			case SORT_OPTIONS.TITLE_ASC:
				sortedMovies.sort((firstMovie, secondMovie) =>
					firstMovie.title.localeCompare(secondMovie.title)
				);
				break;
			case SORT_OPTIONS.YEAR_ASC:
				sortedMovies.sort(
					(firstMovie, secondMovie) => Number(firstMovie.releaseYear) - Number(secondMovie.releaseYear)
				);
				break;
			case SORT_OPTIONS.YEAR_DESC:
			default:
				sortedMovies.sort(
					(firstMovie, secondMovie) => Number(secondMovie.releaseYear) - Number(firstMovie.releaseYear)
				);
				break;
		}

		return sortedMovies;
	}, [sourceMovies, sortOption]);

	const handleToggleFavorite = useCallback(
		async (movieId) => {
			if (!isAuthenticated) {
				showToast.info('Please sign in to save favorites.');
				return;
			}

			const wasFavorite = isFavorite(movieId);

			try {
				await toggleFavorite(movieId);
				showToast.success(wasFavorite ? 'Removed from favorites' : 'Added to favorites');
			} catch (error) {
				showToast.error(extractErrorMessage(error));
			}
		},
		[isAuthenticated, isFavorite, toggleFavorite]
	);

	const favoriteActionSlotBuilder = useCallback(
		(movie) => {
			if (!isAuthenticated) {
				return null;
			}

			const isPending = isFavoritesLoading || pendingMovieIds.has(movie.id);

			return (
				<FavoriteButton
					isActive={isFavorite(movie.id)}
					onClick={() => handleToggleFavorite(movie.id)}
					isLoading={isPending}
					disabled={isPending}
				/>
			);
		},
		[handleToggleFavorite, isAuthenticated, isFavorite, isFavoritesLoading, pendingMovieIds]
	);

	const totalPages = Math.max(1, pagination.totalPages || 1);
	const currentPage = pagination.number + 1;
	const isPaginationDisabled = isLoading || pagination.totalElements === 0;

	const rangeStart = pagination.totalElements === 0 ? 0 : pagination.number * pagination.size + 1;
	const rangeEnd =
		pagination.totalElements === 0
			? 0
			: Math.min((pagination.number + 1) * pagination.size, pagination.totalElements);

	const handlePageSizeChange = (event) => {
		syncQueryState({
			size: Number(event.target.value),
			page: DEFAULT_PAGE,
		});
	};

	const handleSortChange = (event) => {
		const nextSort = event.target.value;
		syncQueryState({ sort: nextSort }, { replace: true });
	};

	const handlePrevPage = () => {
		syncQueryState({ page: Math.max(DEFAULT_PAGE, page - 1) });
	};

	const handleNextPage = () => {
		syncQueryState({ page: page + 1 });
	};

	const handleFirstPage = () => {
		syncQueryState({ page: DEFAULT_PAGE });
	};

	const handleLastPage = () => {
		syncQueryState({ page: Math.max(DEFAULT_PAGE, pagination.totalPages - 1) });
	};

	return (
		<section className={styles.page}>
			<header className={styles.header}>
				<div>
					<h1>Browse Movies</h1>
					<p>Discover titles, search quickly, and navigate through the full catalog.</p>
				</div>

				<div className={styles.metaChips}>
					<span>
						Catalog: <strong>{pagination.totalElements}</strong>
					</span>
					<span>
						Page: <strong>{currentPage}</strong>/{totalPages}
					</span>
					<span>
						Showing: <strong>{rangeStart}</strong>-<strong>{rangeEnd}</strong>
					</span>
				</div>
			</header>

			<div className={styles.controlPanel}>
				<div className={styles.searchPanel}>
					<SearchBar
						keyword={keywordParam}
						onKeywordChange={(nextKeyword) =>
							syncQueryState(
								{
									keyword: nextKeyword,
									page: DEFAULT_PAGE,
								},
								{ replace: true }
							)
						}
						showClearButton
						onClear={() =>
							syncQueryState(
								{
									keyword: '',
									page: DEFAULT_PAGE,
								},
								{ replace: true }
							)
						}
					/>

					{isSearchActive ? (
						<p className={styles.searchHint}>
							Search is active on current page results ({displayMovies.length} match(es))
							{isSearching ? ', updating...' : '.'}
						</p>
					) : (
						<p className={styles.searchHint}>
							Type in the search box to find matching titles on the current page.
						</p>
					)}
				</div>

				<div className={styles.filterPanel}>
					<label className={styles.selectField}>
						<span>Sort by</span>
						<select value={sortOption} onChange={handleSortChange}>
							<option value={SORT_OPTIONS.YEAR_DESC}>Release year: newest</option>
							<option value={SORT_OPTIONS.YEAR_ASC}>Release year: oldest</option>
							<option value={SORT_OPTIONS.TITLE_ASC}>Title: A-Z</option>
						</select>
					</label>

					<label className={styles.selectField}>
						<span>Page size</span>
						<select value={size} onChange={handlePageSizeChange}>
							{PAGE_SIZE_OPTIONS.map((option) => (
								<option key={option} value={option}>
									{option} / page
								</option>
							))}
						</select>
					</label>
				</div>
			</div>

			{searchErrorMessage && isSearchActive ? (
				<div className={styles.searchWarning} role="status">
					{searchErrorMessage}
				</div>
			) : null}

			{isLoading ? (
				<BrowseGridSkeleton count={size} />
			) : (
				<MovieGrid
					movies={displayMovies}
					isLoading={false}
					errorMessage={errorMessage}
					actionSlotBuilder={favoriteActionSlotBuilder}
					emptyMessage={
						isSearchActive
							? 'No matching titles on this page. Move to next/previous pages to continue searching.'
							: 'No movies found.'
					}
					onRetry={refetchMovies}
				/>
			)}

			<div className={styles.pagination}>
				<Button
					variant="ghost"
					onClick={handleFirstPage}
					disabled={isPaginationDisabled || pagination.first}
				>
					First
				</Button>
				<Button
					variant="secondary"
					onClick={handlePrevPage}
					disabled={isPaginationDisabled || pagination.first}
				>
					Previous
				</Button>

				<span className={styles.pageIndicator}>
					Page {currentPage} / {totalPages}
				</span>

				<Button
					variant="secondary"
					onClick={handleNextPage}
					disabled={isPaginationDisabled || pagination.last}
				>
					Next
				</Button>
				<Button
					variant="ghost"
					onClick={handleLastPage}
					disabled={isPaginationDisabled || pagination.last}
				>
					Last
				</Button>
			</div>
		</section>
	);
}

export default BrowsePage;

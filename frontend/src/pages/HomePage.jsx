import ErrorMessage from '@components/UI/ErrorMessage';
import Skeleton from '@components/UI/Skeleton';
import Button from '@components/UI/Button';
import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { HeroBanner, MovieRow, SearchBar, useMovies, useSearchMovies } from '@features/movies';
import { FavoriteButton, useFavorites } from '@features/favorites';
import showToast from '@components/UI/Toast';
import { formatYear } from '@utils/helpers';
import { extractErrorMessage } from '@utils/helpers';
import styles from './HomePage.module.css';

function HomePageSkeleton() {
	return (
		<section className={styles.page} aria-label="Loading homepage">
			<div className={styles.heroBlock}>
				<Skeleton variant="card" />
				<div className={styles.statsPanel}>
					<Skeleton variant="line" />
					<Skeleton variant="line" />
					<Skeleton variant="line" />
				</div>
			</div>
			<div className={styles.quickActions}>
				<Skeleton variant="line" />
				<Skeleton variant="line" />
			</div>
			<div className={styles.rowSkeleton}>
				{Array.from({ length: 6 }).map((_, index) => (
					<Skeleton key={index} variant="card" />
				))}
			</div>
		</section>
	);
}

function HomePage() {
	const { user, isAuthenticated } = useAuth();
	const {
		isFavorite,
		toggleFavorite,
		pendingMovieIds,
		isLoading: isFavoritesLoading,
	} = useFavorites({ enabled: isAuthenticated });
	const { movies, pagination, isLoading, errorMessage, isEmpty, refetchMovies } = useMovies({
		page: 0,
		size: 24,
	});
	const {
		keyword,
		setKeyword,
		filteredMovies,
		isSearching,
		searchErrorMessage,
		isSearchActive,
	} = useSearchMovies(movies);

	const { featuredMovie, trendingMovies, newestMovies, throwbackMovies, lateNightMovies } = useMemo(() => {
		if (!movies.length) {
			return {
				featuredMovie: null,
				trendingMovies: [],
				newestMovies: [],
				throwbackMovies: [],
				lateNightMovies: [],
			};
		}

		const [firstMovie, ...remainingMovies] = movies;
		const releaseYearSorter = (a, b) => Number(b.releaseYear) - Number(a.releaseYear);
		const reverseReleaseYearSorter = (a, b) => Number(a.releaseYear) - Number(b.releaseYear);

		return {
			featuredMovie: firstMovie,
			trendingMovies: remainingMovies.slice(0, 12),
			newestMovies: [...remainingMovies].sort(releaseYearSorter).slice(0, 12),
			throwbackMovies: [...remainingMovies].sort(reverseReleaseYearSorter).slice(0, 12),
			lateNightMovies: remainingMovies.filter((_, index) => index % 2 === 0).slice(0, 12),
		};
	}, [movies]);

	const releaseYears = useMemo(
		() => movies.map((movie) => Number(movie.releaseYear)).filter(Number.isFinite),
		[movies]
	);

	const newestYear = releaseYears.length ? Math.max(...releaseYears) : null;
	const earliestYear = releaseYears.length ? Math.min(...releaseYears) : null;
	const activeMovies = isSearchActive ? filteredMovies : movies;

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

	if (isLoading) {
		return <HomePageSkeleton />;
	}

	if (errorMessage) {
		return <ErrorMessage message={errorMessage} onRetry={refetchMovies} />;
	}

	if (isEmpty) {
		return (
			<section className={styles.emptyState}>
				<h1>Ready for movie night?</h1>
				<p>The catalog is empty right now. Please check back later or refresh.</p>
				<Button onClick={refetchMovies}>Refresh catalog</Button>
			</section>
		);
	}

	return (
		<section className={styles.page}>
			<div className={`${styles.heroBlock} fadeIn`}>
				<HeroBanner movie={featuredMovie} />

				<aside className={styles.statsPanel} aria-label="Homepage insights">
					<p className={styles.welcomeText}>
						{isAuthenticated
							? `Welcome back, ${user?.username || 'movie lover'}!`
							: 'Welcome to Watch!'}
					</p>
					<h2>Tonight at a glance</h2>
					<ul className={styles.statsList}>
						<li>
							<span>Titles in this feed</span>
							<strong>{movies.length}</strong>
						</li>
						<li>
							<span>Total catalog (server)</span>
							<strong>{pagination.totalElements || movies.length}</strong>
						</li>
						<li>
							<span>Release span</span>
							<strong>
								{newestYear && earliestYear
									? `${formatYear(earliestYear)} - ${formatYear(newestYear)}`
									: 'N/A'}
							</strong>
						</li>
					</ul>
				</aside>
			</div>

			<div className={`${styles.quickActions} slideUp`}>
				<div>
					<h3>Explore more stories</h3>
					<p>Browse the full catalog, search quickly, and stream what fits your mood.</p>
					<div className={styles.quickSearch}>
						<SearchBar
							keyword={keyword}
							onKeywordChange={setKeyword}
							showClearButton
							onClear={() => setKeyword('')}
						/>
						{isSearching ? <p className={styles.searchHint}>Searching...</p> : null}
						{searchErrorMessage ? (
							<p className={styles.searchError}>{searchErrorMessage}</p>
						) : null}
						{isSearchActive && !isSearching && !searchErrorMessage ? (
							<p className={styles.searchHint}>{filteredMovies.length} result(s) on this feed.</p>
						) : null}
					</div>
				</div>
				<div className={styles.actionButtons}>
					<Link to="/browse">
						<Button>Browse all movies</Button>
					</Link>
					<Link to={isAuthenticated ? '/favorites' : '/login'}>
						<Button variant="secondary">
							{isAuthenticated ? 'Open my favorites' : 'Sign in to save favorites'}
						</Button>
					</Link>
				</div>
			</div>

			{isSearchActive ? (
				<MovieRow
					title={`Search results for "${keyword.trim()}"`}
					movies={activeMovies}
					enableCinematic
					rowIndex={0}
					actionSlotBuilder={favoriteActionSlotBuilder}
				/>
			) : (
				<>
					<MovieRow
						title="Trending now"
						movies={trendingMovies.length ? trendingMovies : movies}
						enableCinematic
						rowIndex={0}
						actionSlotBuilder={favoriteActionSlotBuilder}
					/>
					<MovieRow
						title="Fresh drops"
						movies={newestMovies}
						enableCinematic
						rowIndex={1}
						actionSlotBuilder={favoriteActionSlotBuilder}
					/>
					<MovieRow
						title="Throwback gems"
						movies={throwbackMovies}
						enableCinematic
						rowIndex={2}
						actionSlotBuilder={favoriteActionSlotBuilder}
					/>
					<MovieRow
						title="Late night picks"
						movies={lateNightMovies}
						enableCinematic
						rowIndex={3}
						actionSlotBuilder={favoriteActionSlotBuilder}
					/>
				</>
			)}
		</section>
	);
}

export default HomePage;

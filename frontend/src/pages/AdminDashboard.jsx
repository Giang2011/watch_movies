import { useMemo, useState } from 'react';
import Button from '@components/UI/Button';
import Modal from '@components/UI/Modal';
import showToast from '@components/UI/Toast';
import { extractErrorMessage } from '@utils/helpers';
import { SearchBar } from '@features/movies';
import { AdminSidebar, MovieForm, MovieTable, useAdminMovies } from '@features/admin';
import styles from './AdminDashboard.module.css';

const PAGE_SIZE_OPTIONS = [8, 12, 20];

const SORT_OPTIONS = {
	TITLE_ASC: 'title-asc',
	TITLE_DESC: 'title-desc',
	YEAR_DESC: 'year-desc',
	YEAR_ASC: 'year-asc',
};

const DEFAULT_SORT = SORT_OPTIONS.YEAR_DESC;

function AdminDashboard() {
	const {
		movies,
		pagination,
		page,
		size,
		setPage,
		setSize,
		isLoading,
		isCreatingMovie,
		pendingUpdateMovieId,
		pendingDeleteMovieIds,
		errorMessage,
		refetchMovies,
		createMovie,
		updateMovie,
		removeMovie,
	} = useAdminMovies();
	const [keyword, setKeyword] = useState('');
	const [sortOption, setSortOption] = useState(DEFAULT_SORT);
	const [editingMovie, setEditingMovie] = useState(null);

	const normalizedKeyword = keyword.trim().toLowerCase();

	const filteredMovies = useMemo(() => {
		if (!normalizedKeyword) {
			return movies;
		}

		return movies.filter((movie) => {
			const normalizedTitle = String(movie.title || '').toLowerCase();
			const normalizedDescription = String(movie.description || '').toLowerCase();

			return (
				normalizedTitle.includes(normalizedKeyword) ||
				normalizedDescription.includes(normalizedKeyword)
			);
		});
	}, [movies, normalizedKeyword]);

	const displayMovies = useMemo(() => {
		const sortedMovies = [...filteredMovies];

		switch (sortOption) {
			case SORT_OPTIONS.TITLE_ASC:
				sortedMovies.sort((firstMovie, secondMovie) =>
					String(firstMovie.title || '').localeCompare(String(secondMovie.title || ''))
				);
				break;
			case SORT_OPTIONS.TITLE_DESC:
				sortedMovies.sort((firstMovie, secondMovie) =>
					String(secondMovie.title || '').localeCompare(String(firstMovie.title || ''))
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
	}, [filteredMovies, sortOption]);

	const currentPage = pagination.number + 1;
	const totalPages = Math.max(1, pagination.totalPages || 1);

	const isPaginationDisabled = isLoading || pagination.totalElements === 0;
	const rangeStart = pagination.totalElements === 0 ? 0 : pagination.number * pagination.size + 1;
	const rangeEnd =
		pagination.totalElements === 0
			? 0
			: Math.min((pagination.number + 1) * pagination.size, pagination.totalElements);

	const editFormLoading = editingMovie ? pendingUpdateMovieId === editingMovie.id : false;

	const emptyMessage = normalizedKeyword
		? `No movies on this page match "${keyword.trim()}".`
		: 'No movies found for management.';

	const handleCreate = async (formData) => {
		try {
			await createMovie(formData);
			showToast.success('Movie created successfully');
		} catch (error) {
			showToast.error(extractErrorMessage(error));
			throw error;
		}
	};

	const handleOpenEdit = (movie) => {
		setEditingMovie(movie);
	};

	const handleCloseEdit = () => {
		if (editFormLoading) {
			return;
		}

		setEditingMovie(null);
	};

	const handleUpdate = async (formData) => {
		if (!editingMovie) {
			return;
		}

		try {
			await updateMovie(editingMovie.id, formData);
			showToast.success('Movie updated successfully');
			setEditingMovie(null);
		} catch (error) {
			showToast.error(extractErrorMessage(error));
			throw error;
		}
	};

	const handleDelete = async (movieId) => {
		if (!window.confirm('Delete this movie permanently?')) {
			return;
		}

		try {
			await removeMovie(movieId);
			showToast.success('Movie deleted successfully');
		} catch (error) {
			showToast.error(extractErrorMessage(error));
		}
	};

	return (
		<section className={styles.page}>
			<AdminSidebar />
			<div className={styles.content}>
				<header className={styles.header}>
					<div>
						<h1>Admin Dashboard</h1>
						<p>Manage movie catalog with create, update, delete, and pagination controls.</p>
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
							keyword={keyword}
							onKeywordChange={setKeyword}
							showClearButton
							onClear={() => setKeyword('')}
						/>
						<p>
							Search filters current server page ({movies.length} rows loaded for this page).
						</p>
					</div>

					<div className={styles.actions}>
						<label className={styles.selectField}>
							<span>Sort by</span>
							<select value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
								<option value={SORT_OPTIONS.YEAR_DESC}>Release year: newest</option>
								<option value={SORT_OPTIONS.YEAR_ASC}>Release year: oldest</option>
								<option value={SORT_OPTIONS.TITLE_ASC}>Title: A-Z</option>
								<option value={SORT_OPTIONS.TITLE_DESC}>Title: Z-A</option>
							</select>
						</label>

						<label className={styles.selectField}>
							<span>Page size</span>
							<select
								value={size}
								onChange={(event) => {
									setSize(Number(event.target.value));
									setPage(0);
								}}
							>
								{PAGE_SIZE_OPTIONS.map((option) => (
									<option key={option} value={option}>
										{option} / page
									</option>
								))}
							</select>
						</label>

						<Button variant="secondary" onClick={refetchMovies} disabled={isLoading}>
							Refresh
						</Button>
					</div>
				</div>

				<div className={styles.workspace}>
					<MovieForm mode="create" onSubmit={handleCreate} isLoading={isCreatingMovie} />

					<MovieTable
						movies={displayMovies}
						isLoading={isLoading}
						errorMessage={errorMessage}
						onRetry={refetchMovies}
						onDelete={handleDelete}
						onEdit={handleOpenEdit}
						pendingDeleteMovieIds={pendingDeleteMovieIds}
						emptyMessage={emptyMessage}
					/>
				</div>

				<div className={styles.pagination}>
					<Button variant="ghost" onClick={() => setPage(0)} disabled={isPaginationDisabled || pagination.first}>
						First
					</Button>
					<Button
						variant="secondary"
						onClick={() => setPage(Math.max(0, page - 1))}
						disabled={isPaginationDisabled || pagination.first}
					>
						Previous
					</Button>

					<span className={styles.pageIndicator}>
						Page {currentPage} / {totalPages}
					</span>

					<Button
						variant="secondary"
						onClick={() => setPage(page + 1)}
						disabled={isPaginationDisabled || pagination.last}
					>
						Next
					</Button>
					<Button
						variant="ghost"
						onClick={() => setPage(Math.max(0, pagination.totalPages - 1))}
						disabled={isPaginationDisabled || pagination.last}
					>
						Last
					</Button>
				</div>
			</div>

			<Modal isOpen={Boolean(editingMovie)} title="Edit movie" onClose={handleCloseEdit}>
				{editingMovie ? (
					<MovieForm
						mode="edit"
						initialMovie={editingMovie}
						onSubmit={handleUpdate}
						onCancel={handleCloseEdit}
						isLoading={editFormLoading}
						submitLabel="Save changes"
					/>
				) : null}
			</Modal>
		</section>
	);
}

export default AdminDashboard;

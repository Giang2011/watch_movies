import Button from '@components/UI/Button';
import Spinner from '@components/UI/Spinner';
import ErrorMessage from '@components/UI/ErrorMessage';
import fallbackThumbnail from '@assets/images/fallback-thumbnail.jpg';
import { getFullMediaUrl, formatYear } from '@utils/helpers';
import styles from './MovieTable.module.css';

const EMPTY_PENDING_DELETE_IDS = new Set();

function MovieTable({
	movies,
	isLoading,
	errorMessage,
	onRetry,
	onDelete,
	onEdit,
	pendingDeleteMovieIds = EMPTY_PENDING_DELETE_IDS,
	emptyMessage = 'No movies found for management.',
}) {
	if (isLoading) {
		return <Spinner label="Loading admin movies" />;
	}

	if (errorMessage) {
		return <ErrorMessage message={errorMessage} onRetry={onRetry} />;
	}

	if (!movies.length) {
		return <p className={styles.empty}>{emptyMessage}</p>;
	}

	return (
		<div className={styles.tableWrap}>
			<table className={styles.table}>
				<thead>
					<tr>
						<th>ID</th>
						<th>Thumbnail</th>
						<th>Title</th>
						<th>Year</th>
						<th>Description</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{movies.map((movie) => {
						const isDeleting = pendingDeleteMovieIds.has(movie.id);

						return (
							<tr key={movie.id}>
								<td>{movie.id}</td>
								<td>
									<img
										className={styles.thumbnail}
										src={getFullMediaUrl(movie.thumbnailUrl) || fallbackThumbnail}
										alt={movie.title}
										loading="lazy"
										onError={(event) => {
											event.currentTarget.src = fallbackThumbnail;
										}}
									/>
								</td>
								<td>{movie.title}</td>
								<td>{formatYear(movie.releaseYear)}</td>
								<td className={styles.description}>{movie.description}</td>
								<td className={styles.actions}>
									<Button variant="secondary" onClick={() => onEdit(movie)} disabled={isDeleting}>
										Edit
									</Button>
									<Button variant="ghost" onClick={() => onDelete(movie.id)} disabled={isDeleting}>
										{isDeleting ? 'Deleting...' : 'Delete'}
									</Button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

export default MovieTable;

import Input from '@components/UI/Input';
import styles from './SearchBar.module.css';

function SearchBar({ keyword, onKeywordChange, onClear, showClearButton = false }) {
	const isClearVisible = showClearButton && keyword.trim().length > 0;

	return (
		<div className={styles.searchWrap}>
			<Input
				name="keyword"
				label="Search movies"
				placeholder="Type movie title"
				value={keyword}
				onChange={(event) => onKeywordChange(event.target.value)}
				rightSlot={
					isClearVisible ? (
						<button
							type="button"
							className={styles.clearButton}
							onClick={() => {
								if (onClear) {
									onClear();
									return;
								}

								onKeywordChange('');
							}}
							aria-label="Clear search"
						>
							Clear
						</button>
					) : null
				}
			/>
		</div>
	);
}

export default SearchBar;

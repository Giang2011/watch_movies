import { useEffect, useMemo, useState } from 'react';
import Button from '@components/UI/Button';
import ErrorMessage from '@components/UI/ErrorMessage';
import Input from '@components/UI/Input';
import styles from './MovieForm.module.css';

const initialValues = {
	title: '',
	description: '',
	releaseYear: '',
	thumbnail: null,
	video: null,
};

function toFormValues(movie) {
	if (!movie) {
		return initialValues;
	}

	return {
		title: movie.title || '',
		description: movie.description || '',
		releaseYear: movie.releaseYear ? String(movie.releaseYear) : '',
		thumbnail: null,
		video: null,
	};
}

function MovieForm({
	mode = 'create',
	initialMovie = null,
	onSubmit,
	onCancel,
	isLoading,
	submitLabel,
}) {
	const [formValues, setFormValues] = useState(initialValues);
	const [formErrorMessage, setFormErrorMessage] = useState('');

	const isCreateMode = mode === 'create';
	const resolvedSubmitLabel = submitLabel || (isCreateMode ? 'Save movie' : 'Update movie');

	useEffect(() => {
		setFormValues(toFormValues(initialMovie));
		setFormErrorMessage('');
	}, [initialMovie, mode]);

	const helperText = useMemo(() => {
		if (isCreateMode) {
			return 'Create requires both thumbnail and video files (max 10MB each).';
		}

		return 'Edit requires title, description, and release year. Media files are optional.';
	}, [isCreateMode]);

	const handleChange = (event) => {
		const { name, value, files } = event.target;
		setFormErrorMessage('');

		setFormValues((prevFormValues) => ({
			...prevFormValues,
			[name]: files ? files[0] : value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setFormErrorMessage('');

		const title = formValues.title.trim();
		const description = formValues.description.trim();
		const releaseYear = Number(formValues.releaseYear);

		if (!title || !description || !Number.isFinite(releaseYear)) {
			setFormErrorMessage('Title, description, and release year are required.');
			return;
		}

		if (releaseYear < 1888 || releaseYear > 2100) {
			setFormErrorMessage('Release year must be between 1888 and 2100.');
			return;
		}

		if (isCreateMode && (!formValues.thumbnail || !formValues.video)) {
			setFormErrorMessage('Thumbnail and video are required when creating a movie.');
			return;
		}

		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('releaseYear', String(releaseYear));
		if (formValues.thumbnail) {
			formData.append('thumbnail', formValues.thumbnail);
		}
		if (formValues.video) {
			formData.append('video', formValues.video);
		}

		try {
			await onSubmit(formData);

			if (isCreateMode) {
				setFormValues(initialValues);
			}
		} catch (error) {
			setFormErrorMessage(error?.message || 'Failed to submit movie form.');
		}
	};

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<h3>{isCreateMode ? 'Add movie' : 'Edit movie'}</h3>
			<p className={styles.helperText}>{helperText}</p>

			{formErrorMessage ? <ErrorMessage message={formErrorMessage} /> : null}

			<Input name="title" label="Title" value={formValues.title} onChange={handleChange} required />

			<div className={styles.field}>
				<label htmlFor={`movie-description-${mode}`}>Description</label>
				<textarea
					id={`movie-description-${mode}`}
					name="description"
					value={formValues.description}
					onChange={handleChange}
					required
					rows={4}
				/>
			</div>

			<Input
				name="releaseYear"
				type="number"
				label="Release year"
				value={formValues.releaseYear}
				onChange={handleChange}
				min={1888}
				max={2100}
				required
			/>

			<div className={styles.fileField}>
				<label htmlFor={`thumbnail-${mode}`}>
					Thumbnail {isCreateMode ? '(required)' : '(optional)'}
				</label>
				<input
					id={`thumbnail-${mode}`}
					name="thumbnail"
					type="file"
					accept="image/*"
					onChange={handleChange}
					required={isCreateMode}
				/>
				{formValues.thumbnail ? <small>{formValues.thumbnail.name}</small> : null}
			</div>

			<div className={styles.fileField}>
				<label htmlFor={`video-${mode}`}>Video {isCreateMode ? '(required)' : '(optional)'}</label>
				<input
					id={`video-${mode}`}
					name="video"
					type="file"
					accept="video/*"
					onChange={handleChange}
					required={isCreateMode}
				/>
				{formValues.video ? <small>{formValues.video.name}</small> : null}
			</div>

			<div className={styles.actions}>
				<Button type="submit" isLoading={isLoading} disabled={isLoading}>
					{resolvedSubmitLabel}
				</Button>

				{onCancel ? (
					<Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
						Cancel
					</Button>
				) : null}
			</div>
		</form>
	);
}

export default MovieForm;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@components/UI/Button';
import Input from '@components/UI/Input';
import ErrorMessage from '@components/UI/ErrorMessage';
import showToast from '@components/UI/Toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '@features/auth';
import styles from './LoginForm.module.css';

const initialForm = {
	username: '',
	password: '',
};

function LoginForm() {
	const [formValues, setFormValues] = useState(initialForm);
	const [errorMessage, setErrorMessage] = useState('');
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const { login, isLoading } = useAuth();
	const navigate = useNavigate();

	const validateForm = () => {
		const username = formValues.username.trim();
		const password = formValues.password.trim();

		if (!username || !password) {
			return 'Username and password are required.';
		}

		if (username.length < 3) {
			return 'Username must be at least 3 characters.';
		}

		return '';
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormValues((prevFormValues) => ({
			...prevFormValues,
			[name]: value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setErrorMessage('');

		const validationMessage = validateForm();
		if (validationMessage) {
			setErrorMessage(validationMessage);
			return;
		}

		try {
			await login({
				username: formValues.username.trim(),
				password: formValues.password,
			});
			showToast.success('Login successful');
			navigate('/browse');
		} catch (error) {
			setErrorMessage(error.message);
		}
	};

	const handleTogglePasswordVisibility = () => {
		setIsPasswordVisible((prevState) => !prevState);
	};

	const validationMessage = validateForm();
	const isSubmitDisabled = Boolean(validationMessage) || isLoading;

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<h2>Welcome back</h2>
			<p className={styles.subtitle}>Sign in to continue watching your favorite movies.</p>
			<Input
				name="username"
				label="Username"
				value={formValues.username}
				onChange={handleChange}
				autoComplete="username"
				required
			/>
			<Input
				name="password"
				type={isPasswordVisible ? 'text' : 'password'}
				label="Password"
				value={formValues.password}
				onChange={handleChange}
				autoComplete="current-password"
				required
			/>
			<div className={styles.passwordActions}>
				<button
					type="button"
					className={styles.passwordToggle}
					onClick={handleTogglePasswordVisibility}
					aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
					title={isPasswordVisible ? 'Hide password' : 'Show password'}
				>
					{isPasswordVisible ? <FaEyeSlash aria-hidden /> : <FaEye aria-hidden />}
				</button>
			</div>

			{errorMessage ? <ErrorMessage message={errorMessage} /> : null}

			<Button type="submit" isLoading={isLoading} disabled={isSubmitDisabled}>
				Sign In
			</Button>
		</form>
	);
}

export default LoginForm;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@components/UI/Button';
import Input from '@components/UI/Input';
import ErrorMessage from '@components/UI/ErrorMessage';
import showToast from '@components/UI/Toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '@features/auth';
import styles from './SignupForm.module.css';

const initialForm = {
	username: '',
	email: '',
	password: '',
	confirmPassword: '',
};

function SignupForm() {
	const [formValues, setFormValues] = useState(initialForm);
	const [errorMessage, setErrorMessage] = useState('');
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
	const { signup, isLoading } = useAuth();
	const navigate = useNavigate();

	const validateForm = () => {
		const username = formValues.username.trim();
		const email = formValues.email.trim();

		if (!username || !email || !formValues.password || !formValues.confirmPassword) {
			return 'All fields are required.';
		}

		if (username.length < 3) {
			return 'Username must be at least 3 characters.';
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return 'Please enter a valid email address.';
		}

		if (formValues.password.length < 6) {
			return 'Password must be at least 6 characters.';
		}

		if (formValues.password !== formValues.confirmPassword) {
			return 'Password confirmation does not match.';
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
			await signup({
				username: formValues.username.trim(),
				email: formValues.email.trim(),
				password: formValues.password,
			});
			showToast.success('Account created. Please login.');
			navigate('/login');
		} catch (error) {
			setErrorMessage(error.message);
		}
	};

	const handleTogglePasswordVisibility = () => {
		setIsPasswordVisible((prevState) => !prevState);
	};

	const handleToggleConfirmPasswordVisibility = () => {
		setIsConfirmPasswordVisible((prevState) => !prevState);
	};

	const validationMessage = validateForm();
	const isSubmitDisabled = Boolean(validationMessage) || isLoading;

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<h2>Create account</h2>
			<p className={styles.subtitle}>Create your account to save favorites and continue watching.</p>
			<Input
				name="username"
				label="Username"
				value={formValues.username}
				onChange={handleChange}
				autoComplete="username"
				required
			/>
			<Input
				name="email"
				type="email"
				label="Email"
				value={formValues.email}
				onChange={handleChange}
				autoComplete="email"
				required
			/>
			<Input
				name="password"
				type={isPasswordVisible ? 'text' : 'password'}
				label="Password"
				value={formValues.password}
				onChange={handleChange}
				autoComplete="new-password"
				minLength={6}
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
			<Input
				name="confirmPassword"
				type={isConfirmPasswordVisible ? 'text' : 'password'}
				label="Confirm password"
				value={formValues.confirmPassword}
				onChange={handleChange}
				autoComplete="new-password"
				minLength={6}
				required
			/>
			<div className={styles.passwordActions}>
				<button
					type="button"
					className={styles.passwordToggle}
					onClick={handleToggleConfirmPasswordVisibility}
					aria-label={isConfirmPasswordVisible ? 'Hide password' : 'Show password'}
					title={isConfirmPasswordVisible ? 'Hide password' : 'Show password'}
				>
					{isConfirmPasswordVisible ? <FaEyeSlash aria-hidden /> : <FaEye aria-hidden />}
				</button>
			</div>

			{errorMessage ? <ErrorMessage message={errorMessage} /> : null}

			<Button type="submit" isLoading={isLoading} disabled={isSubmitDisabled}>
				Sign Up
			</Button>
			<p className={styles.hint}>By signing up, you agree to our basic platform terms.</p>
		</form>
	);
}

export default SignupForm;

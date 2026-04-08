import Button from './Button';

function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
	return (
		<div className="app-error" role="alert">
			<p>{message}</p>
			{onRetry ? (
				<Button variant="secondary" onClick={onRetry}>
					Retry
				</Button>
			) : null}
		</div>
	);
}

export default ErrorMessage;

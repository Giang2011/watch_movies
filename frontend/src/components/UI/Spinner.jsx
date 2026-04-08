function Spinner({ fullscreen = false, label = 'Loading...' }) {
	if (fullscreen) {
		return (
			<div className="app-spinner-screen" role="status" aria-live="polite" aria-label={label}>
				<div className="app-spinner" />
				<p>{label}</p>
			</div>
		);
	}

	return (
		<div className="app-spinner-inline" role="status" aria-live="polite" aria-label={label}>
			<div className="app-spinner" />
			<span>{label}</span>
		</div>
	);
}

export default Spinner;

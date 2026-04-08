function Skeleton({ variant = 'line' }) {
	return <div className={`app-skeleton app-skeleton-${variant}`} aria-hidden="true" />;
}

export default Skeleton;

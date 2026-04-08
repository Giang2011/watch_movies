import { useEffect } from 'react';
import styles from './Modal.module.css';

function Modal({ isOpen, title, children, onClose }) {
	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		const handleEscape = (event) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	return (
		<div className={styles.overlay} role="presentation" onClick={onClose}>
			<div
				className={styles.modal}
				role="dialog"
				aria-modal="true"
				aria-label={title || 'Dialog'}
				onClick={(event) => event.stopPropagation()}
			>
				<div className={styles.header}>
					<h3>{title}</h3>
					<button type="button" className={styles.close} onClick={onClose}>
						x
					</button>
				</div>
				<div className={styles.content}>{children}</div>
			</div>
		</div>
	);
}

export default Modal;

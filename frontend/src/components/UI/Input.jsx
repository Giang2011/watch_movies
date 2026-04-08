import styles from './Input.module.css';

function Input({
	id,
	name,
	type = 'text',
	label,
	value,
	placeholder,
	onChange,
	required = false,
	autoComplete,
	rightSlot = null,
	...inputProps
}) {
	return (
		<div className={styles.field}>
			{label ? (
				<label htmlFor={id || name} className={styles.label}>
					{label}
				</label>
			) : null}
			<div className={styles.inputWrap}>
				<input
					id={id || name}
					name={name}
					className={`${styles.input} ${rightSlot ? styles.withRightSlot : ''}`}
					type={type}
					value={value}
					placeholder={placeholder}
					onChange={onChange}
					required={required}
					autoComplete={autoComplete}
					{...inputProps}
				/>
				{rightSlot ? <div className={styles.rightSlot}>{rightSlot}</div> : null}
			</div>
		</div>
	);
}

export default Input;

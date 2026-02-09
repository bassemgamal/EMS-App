import styles from './FormField.module.css';

const FormField = ({ label, type = "text", value, onChange, placeholder, options, ...rest }) => {
    return (
        <div className={styles.field}>
            <label className={styles.label}>{label}</label>
            {type === "select" ? (
                <select className={styles.input} value={value} onChange={onChange} {...rest}>
                    <option value="">اختر {label}...</option>
                    {options.map((opt, idx) => {
                        const isObj = typeof opt === 'object' && opt !== null;
                        const val = isObj ? opt.value : opt;
                        const lbl = isObj ? opt.label : opt;
                        return <option key={val || idx} value={val}>{lbl}</option>;
                    })}
                </select>
            ) : type === "textarea" ? (
                <textarea
                    className={styles.textarea}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    {...rest}
                />
            ) : (
                <input
                    type={type}
                    className={styles.input}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    {...rest}
                />
            )}
        </div>
    );
};

export default FormField;

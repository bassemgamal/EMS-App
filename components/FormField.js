import styles from './FormField.module.css';

const FormField = ({ label, type = "text", value, onChange, placeholder, options }) => {
    return (
        <div className={styles.field}>
            <label className={styles.label}>{label}</label>
            {type === "select" ? (
                <select className={styles.input} value={value} onChange={onChange}>
                    <option value="">اختر {label}...</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : type === "textarea" ? (
                <textarea
                    className={styles.textarea}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type={type}
                    className={styles.input}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
};

export default FormField;

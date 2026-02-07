import styles from './Card.module.css';

const Card = ({ children, title, actions }) => {
    return (
        <div className={styles.card}>
            {(title || actions) && (
                <div className={styles.header}>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    {actions && <div className={styles.actions}>{actions}</div>}
                </div>
            )}
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
};

export default Card;

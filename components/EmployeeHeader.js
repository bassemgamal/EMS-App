"use client";
import { useEmployee } from '@/context/EmployeeContext';
import styles from './EmployeeHeader.module.css';

const EmployeeHeader = () => {
    const { activeEmployee } = useEmployee();

    if (!activeEmployee) return null;

    return (
        <div className={styles.header}>
            <div className={styles.info}>
                <div className={styles.avatar}>
                    {activeEmployee.full_name?.charAt(0)}
                </div>
                <div>
                    <h2 className={styles.name}>{activeEmployee.full_name}</h2>
                    <p className={styles.meta}>
                        المسلسل: <span>{activeEmployee.serial_number}</span> |
                        الرقم القومي: <span>{activeEmployee.national_id}</span>
                    </p>
                </div>
            </div>
            <div className={styles.badge}>
                {activeEmployee.employment_status || 'Active'}
            </div>
        </div>
    );
};

export default EmployeeHeader;

"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import styles from './StatusBar.module.css';

export default function StatusBar({ onPrintMaster }) {
    const { activeEmployee } = useEmployee();
    const { user, logout } = useAuth();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dayName = time.toLocaleDateString('ar-EG', { weekday: 'long' });
    const formattedDate = time.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div className={`${styles.statusBar} no-print`}>
            <div className={styles.section}>
                <span className={styles.clockIcon}>🕒</span>
                <span className={styles.timeText}>{formattedTime}</span>
                <span className={styles.separator}>|</span>
                <span className={styles.dateText}>{dayName}، {formattedDate}</span>
                <div className={styles.themeToggleWrapper}>
                    <ThemeToggle />
                </div>
            </div>

            <div className={styles.section}>
                {user && (
                    <div className={styles.userInfo}>
                        <span className={styles.userRoleBadge}>{user.role === 'ADMIN' ? 'مدير نظام' : user.role === 'MANAGER' ? 'مدير' : 'مشاهد'}</span>
                        <span className={styles.userName}>{user.full_name}</span>
                        <button onClick={logout} className={styles.logoutBtn} title="تسجيل الخروج">🚪 خروج</button>
                    </div>
                )}

                {activeEmployee && <span className={styles.separator}>|</span>}

                {activeEmployee ? (
                    <>
                        <button
                            className={styles.printBriefBtn}
                            onClick={() => onPrintMaster(activeEmployee.employee_id)}
                            title="طباعة بيان حالة وظيفية شامل"
                        >
                            🖨️ طباعة بيان حالة
                        </button>
                        <span className={styles.userIcon}>👤</span>
                        <span className={styles.employeeName}>{activeEmployee.full_name}</span>
                        <span className={styles.employeeId}>#{activeEmployee.employee_id}</span>
                    </>
                ) : (
                    <span className={styles.noUser}>لا يوجد موظف نشط</span>
                )}
            </div>
        </div>
    );
}

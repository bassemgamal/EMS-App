"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'المعلومات الأساسية', path: '/', icon: '👤' },
        { name: 'بيانات الوظيفة', path: '/job-details', icon: '💼' },
        { name: 'تقييم الأداء', path: '/performance', icon: '📈' },
        { name: 'المكافآت والجزاءات', path: '/rewards', icon: '🏆' },
        { name: 'الإجراءات القانونية', path: '/actions', icon: '⚖️' },
        { name: 'المؤهلات العلمية', path: '/qualifications', icon: '🎓' },
        { name: 'الدورات التدريبية', path: '/courses', icon: '📚' },
        { name: 'التنقلات والندب', path: '/transfers', icon: '↔️' },
        { name: 'الإجازات', path: '/leaves', icon: '📅' },
        { name: 'الدرجات الوظيفية', path: '/grades', icon: '⭐' },
        { name: 'التعيينات والترقيات', path: '/appointments', icon: '📝' },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <h1>نظام إدارة الموظفين</h1>
            </div>
            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.name}>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;

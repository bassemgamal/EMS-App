"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'المعلومات الأساسية', path: '/', icon: '👤' },
        { name: 'بيانات الوظيفة', path: '/job-details', icon: '💼' },
        { name: 'تقييم الأداء', path: '/performance', icon: '📈' },
        { name: 'المكافآت والجزاءات', path: '/rewards', icon: '🏆' },
        { name: 'الإجراءات القانونية', path: '/actions', icon: '⚖️' },
        { name: 'المؤهلات العلمية', path: '/qualifications', icon: '🎓' },
        { name: 'الدورات التدريبية', path: '/courses', icon: '📚' },
        { name: 'التنقلات والندب و الإعارة', path: '/transfers', icon: '↔️' },
        { name: 'الإجازات', path: '/leaves', icon: '📅' },
        { name: 'الدرجات الوظيفية', path: '/grades', icon: '⭐' },
        { name: 'التعيينات والتأمينات', path: '/appointments', icon: '📝' },
        { name: 'التقارير والإحصائيات', path: '/reports', icon: '📊' },
    ];

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} no-print`}>
            <div className={styles.logo}>
                {!isCollapsed && <h1>نظام الموظفين</h1>}
                <button
                    className={styles.toggleBtn}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? '☰' : '✕'}
                </button>
            </div>
            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                        title={isCollapsed ? item.name : ''}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        {!isCollapsed && <span className={styles.name}>{item.name}</span>}
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;

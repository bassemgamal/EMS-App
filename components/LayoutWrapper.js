"use client";
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import MasterFile from './MasterFile';

export default function LayoutWrapper({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [masterData, setMasterData] = useState(null);
    const { user, token, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user && pathname !== '/login') {
            router.push('/login');
        }
    }, [user, loading, pathname, router]);

    const handlePrintMaster = async (employeeId) => {
        try {
            const res = await fetch(`http://localhost:5001/api/reports/master-data/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setMasterData(data);

            setTimeout(() => {
                window.print();
                setTimeout(() => setMasterData(null), 2000);
            }, 600);
        } catch (error) {
            console.error('Failed to fetch master data:', error);
            alert('فشل تحميل بيانات بيان الحالة');
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', direction: 'rtl' }}>جاري التحقق من الصلاحيات...</div>;

    // If it's the login page, just show it
    if (pathname === '/login') return <>{children}</>;

    // If not authenticated and not loading, we will be redirected by useEffect
    if (!user) return null;

    return (
        <div style={{ display: 'flex' }} className={masterData ? 'is-printing-master' : ''}>
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main id="main-content" style={{
                marginRight: isCollapsed ? '5rem' : '16.25rem',
                flex: 1,
                minHeight: '100vh',
                background: 'var(--bg-main)',
                padding: '2rem',
                paddingBottom: '3.75rem',
                transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div className="animate-fade-in">
                    {children}
                </div>
            </main>
            <StatusBar onPrintMaster={handlePrintMaster} />

            {masterData && (
                <div className="master-file-print-container">
                    <MasterFile
                        employee={masterData.employee}
                        details={masterData.details}
                    />
                </div>
            )}

            <style jsx global>{`
                @media print {
                    .is-printing-master #main-content,
                    .is-printing-master aside,
                    .is-printing-master .no-print {
                        display: none !important;
                    }
                    
                    .is-printing-master .master-file-print-container {
                        display: block !important;
                    }

                    .master-file-print-container {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}

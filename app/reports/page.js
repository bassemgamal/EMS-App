"use client";
import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import Card from '@/components/Card';
import styles from './page.module.css';

export default function ReportsPage() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOptions, setShowOptions] = useState(false);
    const [visibleSections, setVisibleSections] = useState({
        stats: true,
        gender: true,
        groups: true,
        qualifications: true
    });
    const [landscapeMode, setLandscapeMode] = useState(false);

    const toggleSection = (section) => {
        setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const fetchSummary = async () => {
        try {
            const res = await apiFetch('http://localhost:5001/api/reports/summary');
            const data = await res.json();
            setSummary(data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    if (loading) return <div className={styles.loading}>جاري تحميل التقارير...</div>;

    return (
        <div className={`${styles.container} ${landscapeMode ? styles.landscape : ''}`}>
            {/* Watermark only in print */}
            <div className={styles.watermark}>نظام الموظفين - تقرير رسمي</div>

            {/* Formal Print Header (Visible only in print) */}
            <div className={styles.printHeader}>
                <div className={styles.printHeaderRight}>
                    <div className={styles.printLogo}>🏢</div>
                    <div>
                        <h2>المنظومة المتكاملة لإدارة الموظفين</h2>
                        <p>إدارة الموارد البشرية والشؤون الإدارية</p>
                    </div>
                </div>
                <div className={styles.printHeaderLeft}>
                    <div>تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</div>
                    <div>رقم المستند: REPT-{Math.floor(Math.random() * 10000)}</div>
                </div>
            </div>

            <header className={styles.header}>
                <div>
                    <h1>التقارير والإحصائيات</h1>
                    <p>نظرة عامة على حالة القوة البشرية والبيانات الحالية</p>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={() => setShowOptions(!showOptions)} className={styles.optionsBtn}>
                        ⚙️ تخصيص التقرير
                    </button>
                    <button onClick={() => window.print()} className={styles.printBtn}>📄 طباعة التقرير</button>
                </div>
            </header>

            {showOptions && (
                <div className={`${styles.optionsPanel} no-print`}>
                    <h3>تخصيص بيانات التقرير</h3>
                    <div className={styles.optionsGrid}>
                        <label className={styles.optionLabel}>
                            <input type="checkbox" checked={visibleSections.stats} onChange={() => toggleSection('stats')} />
                            الإحصائيات العامة
                        </label>
                        <label className={styles.optionLabel}>
                            <input type="checkbox" checked={visibleSections.gender} onChange={() => toggleSection('gender')} />
                            توزيع النوع
                        </label>
                        <label className={styles.optionLabel}>
                            <input type="checkbox" checked={visibleSections.groups} onChange={() => toggleSection('groups')} />
                            توزيع المجموعات الوظيفية
                        </label>
                        <label className={styles.optionLabel}>
                            <input type="checkbox" checked={visibleSections.qualifications} onChange={() => toggleSection('qualifications')} />
                            توزيع المؤهلات
                        </label>
                        <span className={styles.divider}>|</span>
                        <label className={styles.optionLabel} style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                            <input type="checkbox" checked={landscapeMode} onChange={() => setLandscapeMode(!landscapeMode)} />
                            وضع الطباعة العرضي (Landscape)
                        </label>
                    </div>
                </div>
            )}

            {visibleSections.stats && (
                <div className={styles.statsGrid}>
                    <Card title="إجمالي الموظفين" icon="👥">
                        <div className={styles.statValue}>{summary?.stats.totalEmployees}</div>
                        <div className={styles.statLabel}>موظف مسجل</div>
                    </Card>
                    <Card title="إجازات سارية اليوم" icon="📅">
                        <div className={styles.statValue}>{summary?.stats.activeLeaves}</div>
                        <div className={styles.statLabel}>أفراد في إجازة</div>
                    </Card>
                    <Card title="المتميزون (90%+)" icon="⭐">
                        <div className={styles.statValue}>{summary?.stats.highPerformers}</div>
                        <div className={styles.statLabel}>تقييم ممتاز هذا العام</div>
                    </Card>
                </div>
            )}

            <div className={styles.chartsGrid}>
                {visibleSections.gender && (
                    <section className={styles.chartSection}>
                        <h3>Distribution by Gender | توزيع النوع</h3>
                        <div className={styles.visualList}>
                            {summary?.distributions.gender.map(item => (
                                <div key={item.gender} className={styles.visualItem}>
                                    <div className={styles.label}>{item.gender || 'غير محدد'}</div>
                                    <div className={styles.barContainer}>
                                        <div
                                            className={styles.bar}
                                            style={{ width: `${(item.count / summary.stats.totalEmployees) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className={styles.count}>{item.count}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {visibleSections.groups && (
                    <section className={styles.chartSection}>
                        <h3>Functional Groups | المجموعات الوظيفية</h3>
                        <div className={styles.visualList}>
                            {summary?.distributions.groups.map(item => (
                                <div key={item.functional_group} className={styles.visualItem}>
                                    <div className={styles.label}>{item.functional_group || 'أخرى'}</div>
                                    <div className={styles.barContainer}>
                                        <div
                                            className={styles.bar}
                                            style={{
                                                width: `${(item.count / summary.stats.totalEmployees) * 100}%`,
                                                backgroundColor: '#38bdf8'
                                            }}
                                        ></div>
                                    </div>
                                    <div className={styles.count}>{item.count}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {visibleSections.qualifications && (
                <section className={styles.detailedSection}>
                    <Card title="توزيع المؤهلات العلمية">
                        <div className={styles.qualGrid}>
                            {summary?.distributions.qualifications.map(item => (
                                <div key={item.qualification_level} className={styles.qualCard}>
                                    <div className={styles.qualName}>{item.qualification_level || 'غير محدد'}</div>
                                    <div className={styles.qualCount}>{item.count}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>
            )}

            {/* Formal Print Footer (Visible only in print) */}
            <div className={styles.printFooter}>
                <div className={styles.signatureBox}>
                    <p>يعتمد مديـر الموارد البشريـة</p>
                    <div className={styles.signatureLine}>.......................................</div>
                </div>
                <div className={styles.signatureBox}>
                    <p>تحريراً في: {new Date().toLocaleDateString('ar-EG')}</p>
                    <p>ختم الجهة</p>
                    <div className={styles.sealCircle}></div>
                </div>
            </div>

            <div className={styles.pageNumber}></div>
        </div>
    );
}

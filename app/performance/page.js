"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function PerformancePage() {
    const { activeEmployee } = useEmployee();
    const { hasRole } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newData, setNewData] = useState({
        evaluation_date: '',
        score: '',
        notes: ''
    });

    const canEdit = hasRole(['ADMIN', 'MANAGER']);
    const canDelete = hasRole(['ADMIN']);

    const getRating = (score) => {
        if (score === null || score === undefined || isNaN(score)) return "---";
        if (score >= 90) return "ممتاز";
        if (score >= 80) return "جيد جداً";
        if (score >= 70) return "جيد";
        if (score >= 50) return "مقبول";
        return "ضعيف";
    };

    const averageScore = records.length > 0
        ? (records.reduce((acc, curr) => acc + Number(curr.score), 0) / records.length).toFixed(1)
        : null;

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/performance`);
            const data = await res.json();
            setRecords(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [activeEmployee]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!canEdit) return;
        setSaving(true);
        try {
            await apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/performance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            setNewData({ evaluation_date: '', score: '', notes: '' });
            fetchRecords();
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!canDelete) return;
        if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
        try {
            await apiFetch(`http://localhost:5001/api/details/performance/${id}`, { method: 'DELETE' });
            fetchRecords();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    if (!activeEmployee) return <div className={styles.container}><p>برجاء اختيار موظف أولاً.</p></div>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />

            <div className={styles.layout}>
                <div className={styles.formCol}>
                    <Card title="إحصائيات الأداء">
                        <div className={styles.statsBox}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>متوسط التقييم:</span>
                                <span className={styles.statValue}>{averageScore || '---'}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>التقدير العام:</span>
                                <span className={styles.ratingValue}>{getRating(Number(averageScore))}</span>
                            </div>
                        </div>
                    </Card>

                    <Card title="إضافة تقييم جديد">
                        <form onSubmit={handleAdd}>
                            <FormField
                                disabled={!canEdit}
                                label="تاريخ التقييم"
                                type="date"
                                value={newData.evaluation_date}
                                onChange={(e) => setNewData({ ...newData, evaluation_date: e.target.value })}
                                required
                            />
                            <FormField
                                disabled={!canEdit}
                                label="الدرجة (0-100)"
                                type="number"
                                value={newData.score}
                                onChange={(e) => setNewData({ ...newData, score: e.target.value })}
                                min="0"
                                max="100"
                                required
                            />
                            <FormField
                                disabled={!canEdit}
                                label="ملاحظات"
                                type="textarea"
                                value={newData.notes}
                                onChange={(e) => setNewData({ ...newData, notes: e.target.value })}
                            />
                            {canEdit ? (
                                <button type="submit" className={styles.saveBtn} disabled={saving}>
                                    {saving ? 'جاري الإضافة...' : 'إضافة سجل'}
                                </button>
                            ) : (
                                <p className={styles.readonlyNote}>وضع العرض فقط</p>
                            )}
                        </form>
                    </Card>
                </div>

                <div className={styles.listCol}>
                    <Card title="سجل الأداء">
                        {loading ? <p>جاري التحميل...</p> : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>التاريخ</th>
                                        <th>الدرجة</th>
                                        <th>ملاحظات</th>
                                        {canDelete && <th>الإجراءات</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.length > 0 ? records.map(reg => (
                                        <tr key={reg.performance_id}>
                                            <td>{new Date(reg.evaluation_date).toLocaleDateString('ar-EG')}</td>
                                            <td>
                                                <div className={styles.scoreBadge} style={{
                                                    '--score-color': reg.score >= 90 ? '#10b981' : reg.score >= 80 ? '#3b82f6' : reg.score >= 70 ? '#f59e0b' : '#ef4444'
                                                }}>
                                                    {reg.score}
                                                </div>
                                            </td>
                                            <td className={styles.notesTd}>{reg.notes}</td>
                                            {canDelete && (
                                                <td>
                                                    <button onClick={() => handleDelete(reg.performance_id)} className={styles.delBtn}>حذف</button>
                                                </td>
                                            )}
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={canDelete ? "4" : "3"} className={styles.noData}>لا يوجد سجلات أداء مضافة بعد</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

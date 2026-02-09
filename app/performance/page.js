"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function PerformancePage() {
    const { activeEmployee } = useEmployee();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newData, setNewData] = useState({
        evaluation_date: '',
        score: '',
        notes: ''
    });

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/performance`);
            const data = await res.json();
            setRecords(data);
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
        setSaving(true);
        try {
            await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/performance`, {
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
        if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
        try {
            await fetch(`http://localhost:5001/api/details/performance/${id}`, { method: 'DELETE' });
            fetchRecords();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    if (!activeEmployee) return <p>برجاء اختيار موظف أولاً.</p>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />

            <div className={styles.layout}>
                <div className={styles.formCol}>
                    <Card title="إضافة تقييم جديد">
                        <form onSubmit={handleAdd}>
                            <FormField
                                label="تاريخ التقييم"
                                type="date"
                                value={newData.evaluation_date}
                                onChange={(e) => setNewData({ ...newData, evaluation_date: e.target.value })}
                            />
                            <FormField
                                label="الدرجة (0-100)"
                                type="number"
                                value={newData.score}
                                onChange={(e) => setNewData({ ...newData, score: e.target.value })}
                            />
                            <FormField
                                label="ملاحظات"
                                type="textarea"
                                value={newData.notes}
                                onChange={(e) => setNewData({ ...newData, notes: e.target.value })}
                            />
                            <button type="submit" className={styles.saveBtn} disabled={saving}>
                                {saving ? 'جاري الإضافة...' : 'إضافة سجل'}
                            </button>
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
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.length > 0 ? records.map(reg => (
                                        <tr key={reg.performance_id}>
                                            <td>{new Date(reg.evaluation_date).toLocaleDateString()}</td>
                                            <td>
                                                <div className={styles.scoreBadge} style={{
                                                    '--score-color': reg.score > 80 ? 'var(--success)' : reg.score > 50 ? 'var(--primary)' : 'var(--danger)'
                                                }}>
                                                    {reg.score}
                                                </div>
                                            </td>
                                            <td className={styles.notesTd}>{reg.notes}</td>
                                            <td>
                                                <button onClick={() => handleDelete(reg.performance_id)} className={styles.delBtn}>حذف</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4">لا يوجد سجلات</td></tr>
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

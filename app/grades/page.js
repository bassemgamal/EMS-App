"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function GradesPage() {
    const { activeEmployee } = useEmployee();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newData, setNewData] = useState({ grade_name: '', promotion_date: '', salary_grade: '' });

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const data = await res.json();
            setRecords(Array.isArray(data) ? data : []);
        } catch (error) { console.error('Fetch failed:', error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRecords(); }, [activeEmployee]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/grades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            setNewData({ grade_name: '', promotion_date: '', salary_grade: '' });
            fetchRecords();
        } catch (error) { console.error('Save failed:', error); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
        try {
            await fetch(`http://localhost:5001/api/details/grades/${id}`, { method: 'DELETE' });
            fetchRecords();
        } catch (error) { console.error('Delete failed:', error); }
    };

    if (!activeEmployee) return <p>برجاء اختيار موظف أولاً.</p>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />
            <div className={styles.layout}>
                <Card title="إضافة ترقية / درجة">
                    <form onSubmit={handleAdd} className={styles.grid}>
                        <FormField label="اسم الدرجة" value={newData.grade_name} onChange={(e) => setNewData({ ...newData, grade_name: e.target.value })} />
                        <FormField label="تاريخ الترقية" type="date" value={newData.promotion_date} onChange={(e) => setNewData({ ...newData, promotion_date: e.target.value })} />
                        <FormField label="درجة المرتب" value={newData.salary_grade} onChange={(e) => setNewData({ ...newData, salary_grade: e.target.value })} />
                        <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإضافة...' : 'إضافة سجل'}</button>
                    </form>
                </Card>
                <Card title="سجل الترقيات">
                    {loading ? <p>جاري التحميل...</p> : (
                        <table className={styles.table}>
                            <thead>
                                <tr><th>الدرجة</th><th>التاريخ</th><th>درجة المرتب</th><th>الإجراءات</th></tr>
                            </thead>
                            <tbody>
                                {records.map(reg => (
                                    <tr key={reg.grade_id}>
                                        <td>{reg.grade_name}</td>
                                        <td>{reg.promotion_date ? new Date(reg.promotion_date).toLocaleDateString('ar-EG') : 'N/A'}</td>
                                        <td>{reg.salary_grade}</td>
                                        <td>
                                            <button onClick={() => handleDelete(reg.grade_id)} className={styles.delBtn}>حذف</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </div>
    );
}

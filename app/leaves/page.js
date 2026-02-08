"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function LeavesPage() {
    const { activeEmployee } = useEmployee();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newData, setNewData] = useState({
        leave_type: '', start_date: '', end_date: '', duration_days: '', reason: '', status: 'Pending'
    });

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/leaves`);
            const data = await res.json();
            setRecords(data);
        } catch (error) { console.error('Fetch failed:', error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRecords(); }, [activeEmployee]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/leaves`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            setNewData({ leave_type: '', start_date: '', end_date: '', duration_days: '', reason: '', status: 'Pending' });
            fetchRecords();
        } catch (error) { console.error('Save failed:', error); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
        try {
            await fetch(`http://localhost:5001/api/details/leaves/${id}`, { method: 'DELETE' });
            fetchRecords();
        } catch (error) { console.error('Delete failed:', error); }
    };

    if (!activeEmployee) return <p>برجاء اختيار موظف أولاً.</p>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />
            <div className={styles.layout}>
                <Card title="طلب إجازة">
                    <form onSubmit={handleAdd} className={styles.grid}>
                        <FormField label="نوع الإجازة" value={newData.leave_type} onChange={(e) => setNewData({ ...newData, leave_type: e.target.value })} />
                        <FormField label="تاريخ البدء" type="date" value={newData.start_date} onChange={(e) => setNewData({ ...newData, start_date: e.target.value })} />
                        <FormField label="تاريخ الانتهاء" type="date" value={newData.end_date} onChange={(e) => setNewData({ ...newData, end_date: e.target.value })} />
                        <FormField label="المدة (بالأيام)" type="number" value={newData.duration_days} onChange={(e) => setNewData({ ...newData, duration_days: e.target.value })} />
                        <div className={styles.fullWidth}>
                            <FormField label="السبب" type="textarea" value={newData.reason} onChange={(e) => setNewData({ ...newData, reason: e.target.value })} />
                        </div>
                        <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإرسال...' : 'إرسال الطلب'}</button>
                    </form>
                </Card>
                <Card title="سجل الإجازات">
                    {loading ? <p>جاري التحميل...</p> : (
                        <table className={styles.table}>
                            <thead>
                                <tr><th>النوع</th><th>البداية</th><th>النهاية</th><th>الحالة</th><th>الإجراءات</th></tr>
                            </thead>
                            <tbody>
                                {records.map(reg => (
                                    <tr key={reg.leave_id}>
                                        <td>{reg.leave_type}</td>
                                        <td>{new Date(reg.start_date).toLocaleDateString()}</td>
                                        <td>{new Date(reg.end_date).toLocaleDateString()}</td>
                                        <td><span className={styles.statusBadge}>{reg.status}</span></td>
                                        <td>
                                            <button onClick={() => handleDelete(reg.leave_id)} className={styles.delBtn}>حذف</button>
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

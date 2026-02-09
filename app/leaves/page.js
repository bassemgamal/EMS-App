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

    const calculateDuration = (start, end) => {
        if (!start || !end) return '';
        const s = new Date(start);
        const e = new Date(end);
        const diffTime = e - s;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : 0;
    };

    const getLeaveStatus = (start, end) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const s = new Date(start);
        const e = new Date(end);

        if (s > today) return { text: 'مؤجلة', class: 'deferred' };
        if (today >= s && today <= e) return { text: 'سارية', class: 'active' };
        if (today > e) return { text: 'منتهية', class: 'ended' };
        return { text: 'غير محدد', class: 'unknown' };
    };

    const getRemainingDays = (end) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const e = new Date(end);
        const diffTime = e - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/leaves`);
            const data = await res.json();
            setRecords(Array.isArray(data) ? data : []);
        } catch (error) { console.error('Fetch failed:', error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRecords(); }, [activeEmployee]);

    const handleDateChange = (field, value) => {
        const updated = { ...newData, [field]: value };
        if (field === 'start_date' || field === 'end_date') {
            updated.duration_days = calculateDuration(updated.start_date, updated.end_date);
        }
        setNewData(updated);
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        if (new Date(newData.end_date) < new Date(newData.start_date)) {
            alert('خطأ: تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء');
            return;
        }

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

    if (!activeEmployee) return <div className={styles.container}><p>برجاء اختيار موظف أولاً.</p></div>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />
            <div className={styles.layout}>
                <Card title="طلب إجازة">
                    <form onSubmit={handleAdd} className={styles.grid}>
                        <FormField label="نوع الإجازة" value={newData.leave_type} onChange={(e) => setNewData({ ...newData, leave_type: e.target.value })} required />
                        <FormField label="تاريخ البدء" type="date" value={newData.start_date} onChange={(e) => handleDateChange('start_date', e.target.value)} required />
                        <FormField label="تاريخ الانتهاء" type="date" value={newData.end_date} onChange={(e) => handleDateChange('end_date', e.target.value)} required />
                        <FormField label="المدة (بالأيام)" type="number" value={newData.duration_days} readOnly />
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
                                <tr>
                                    <th>النوع</th>
                                    <th>البداية</th>
                                    <th>النهاية</th>
                                    <th>المدة</th>
                                    <th>المتبقي</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length > 0 ? records.map(reg => {
                                    const statusInfo = getLeaveStatus(reg.start_date, reg.end_date);
                                    const duration = calculateDuration(reg.start_date, reg.end_date);
                                    const remaining = getRemainingDays(reg.end_date);

                                    return (
                                        <tr key={reg.leave_id}>
                                            <td>{reg.leave_type}</td>
                                            <td>{new Date(reg.start_date).toLocaleDateString('ar-EG')}</td>
                                            <td>{new Date(reg.end_date).toLocaleDateString('ar-EG')}</td>
                                            <td>{duration} يوم</td>
                                            <td>{remaining} يوم</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>
                                                    {statusInfo.text}
                                                </span>
                                            </td>
                                            <td>
                                                <button onClick={() => handleDelete(reg.leave_id)} className={styles.delBtn}>حذف</button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="7" className={styles.noData}>لا يوجد سجلات إجازات</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </div>
    );
}

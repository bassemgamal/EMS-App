"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function ActionsPage() {
    const { activeEmployee } = useEmployee();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newData, setNewData] = useState({
        action_type: '',
        referral_date: '',
        decision_date: '',
        duration_days: '',
        action_number: '',
        authority: '',
        description: '',
        status: '',
        notes: ''
    });

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/actions`);
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
            await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            setNewData({
                action_type: '', referral_date: '', decision_date: '', duration_days: '',
                action_number: '', authority: '', description: '', status: '', notes: ''
            });
            fetchRecords();
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!activeEmployee) return <p>برجاء اختيار موظف أولاً.</p>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />

            <Card title="إضافة إجراء قانوني">
                <form onSubmit={handleAdd} className={styles.grid}>
                    <FormField label="نوع الإجراء" value={newData.action_type} onChange={(e) => setNewData({ ...newData, action_type: e.target.value })} />
                    <FormField label="تاريخ الإحالة" type="date" value={newData.referral_date} onChange={(e) => setNewData({ ...newData, referral_date: e.target.value })} />
                    <FormField label="تاريخ القرار" type="date" value={newData.decision_date} onChange={(e) => setNewData({ ...newData, decision_date: e.target.value })} />
                    <FormField label="المدة (بالأيام)" type="number" value={newData.duration_days} onChange={(e) => setNewData({ ...newData, duration_days: e.target.value })} />
                    <FormField label="رقم الإجراء" value={newData.action_number} onChange={(e) => setNewData({ ...newData, action_number: e.target.value })} />
                    <FormField label="جهة الصدور" value={newData.authority} onChange={(e) => setNewData({ ...newData, authority: e.target.value })} />
                    <div className={styles.fullWidth}>
                        <FormField label="الوصف" type="textarea" value={newData.description} onChange={(e) => setNewData({ ...newData, description: e.target.value })} />
                    </div>
                    <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإضافة...' : 'إضافة إجراء'}</button>
                </form>
            </Card>

            <Card title="سجل الإجراءات">
                {loading ? <p>جاري التحميل...</p> : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>النوع</th>
                                <th>تاريخ القرار</th>
                                <th>جهة الصدور</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(reg => (
                                <tr key={reg.action_id}>
                                    <td>{reg.action_type}</td>
                                    <td>{new Date(reg.decision_date).toLocaleDateString()}</td>
                                    <td>{reg.authority}</td>
                                    <td>{reg.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>
        </div>
    );
}

"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function TransfersPage() {
    const { activeEmployee } = useEmployee();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newData, setNewData] = useState({
        transfer_type: '', decision_number: '', transfer_date: '', from_workplace: '',
        to_workplace: '', governorate: '', region: '', decision_execution_date: '',
        end_date: '', delegation_type: '', delegation_duration: ''
    });

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/transfers`);
            const data = await res.json();
            setRecords(data);
        } catch (error) { console.error('Fetch failed:', error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRecords(); }, [activeEmployee]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/transfers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            setNewData({ transfer_type: '', decision_number: '', transfer_date: '', from_workplace: '', to_workplace: '', governorate: '', region: '', decision_execution_date: '', end_date: '', delegation_type: '', delegation_duration: '' });
            fetchRecords();
        } catch (error) { console.error('Save failed:', error); } finally { setSaving(false); }
    };

    if (!activeEmployee) return <p>برجاء اختيار موظف أولاً.</p>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />
            <div className={styles.layout}>
                <Card title="إضافة نقل / ندب">
                    <form onSubmit={handleAdd} className={styles.grid}>
                        <FormField label="النوع" value={newData.transfer_type} onChange={(e) => setNewData({ ...newData, transfer_type: e.target.value })} />
                        <FormField label="رقم القرار" value={newData.decision_number} onChange={(e) => setNewData({ ...newData, decision_number: e.target.value })} />
                        <FormField label="تاريخ النقل" type="date" value={newData.transfer_date} onChange={(e) => setNewData({ ...newData, transfer_date: e.target.value })} />
                        <FormField label="من جهة العمل" value={newData.from_workplace} onChange={(e) => setNewData({ ...newData, from_workplace: e.target.value })} />
                        <FormField label="إلى جهة العمل" value={newData.to_workplace} onChange={(e) => setNewData({ ...newData, to_workplace: e.target.value })} />
                        <FormField label="المحافظة" value={newData.governorate} onChange={(e) => setNewData({ ...newData, governorate: e.target.value })} />
                        <FormField label="المنطقة" value={newData.region} onChange={(e) => setNewData({ ...newData, region: e.target.value })} />
                        <FormField label="تاريخ التنفيذ" type="date" value={newData.decision_execution_date} onChange={(e) => setNewData({ ...newData, decision_execution_date: e.target.value })} />
                        <FormField label="نوع الندب" value={newData.delegation_type} onChange={(e) => setNewData({ ...newData, delegation_type: e.target.value })} />
                        <FormField label="المدة" type="number" value={newData.delegation_duration} onChange={(e) => setNewData({ ...newData, delegation_duration: e.target.value })} />
                        <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإضافة...' : 'إضافة سجل'}</button>
                    </form>
                </Card>
                <Card title="سجل التنقلات">
                    {loading ? <p>جاري التحميل...</p> : (
                        <table className={styles.table}>
                            <thead>
                                <tr><th>النوع</th><th>من</th><th>إلى</th><th>التاريخ</th></tr>
                            </thead>
                            <tbody>
                                {records.map(reg => (
                                    <tr key={reg.transfer_id}>
                                        <td>{reg.transfer_type}</td>
                                        <td>{reg.from_workplace}</td>
                                        <td>{reg.to_workplace}</td>
                                        <td>{new Date(reg.transfer_date).toLocaleDateString()}</td>
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

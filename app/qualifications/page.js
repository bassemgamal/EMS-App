"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function QualificationsPage() {
    const { activeEmployee } = useEmployee();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newData, setNewData] = useState({
        qualification_type: '', qualification_specialization: '',
        qualification_year: '', qualification_issuer: '', qualification_level: ''
    });

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/qualifications`);
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
            await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/qualifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            setNewData({ qualification_type: '', qualification_specialization: '', qualification_year: '', qualification_issuer: '', qualification_level: '' });
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
            await fetch(`http://localhost:5001/api/details/qualifications/${id}`, { method: 'DELETE' });
            fetchRecords();
        } catch (error) { console.error('Delete failed:', error); }
    };

    if (!activeEmployee) return <p>برجاء اختيار موظف أولاً.</p>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />
            <div className={styles.layout}>
                <Card title="إضافة مؤهل">
                    <form onSubmit={handleAdd} className={styles.grid}>
                        <FormField label="النوع" value={newData.qualification_type} onChange={(e) => setNewData({ ...newData, qualification_type: e.target.value })} />
                        <FormField label="التخصص" value={newData.qualification_specialization} onChange={(e) => setNewData({ ...newData, qualification_specialization: e.target.value })} />
                        <FormField label="السنة" type="number" value={newData.qualification_year} onChange={(e) => setNewData({ ...newData, qualification_year: e.target.value })} />
                        <FormField label="جهة الصدور" value={newData.qualification_issuer} onChange={(e) => setNewData({ ...newData, qualification_issuer: e.target.value })} />
                        <FormField label="المستوى" value={newData.qualification_level} onChange={(e) => setNewData({ ...newData, qualification_level: e.target.value })} />
                        <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإضافة...' : 'إضافة'}</button>
                    </form>
                </Card>
                <Card title="قائمة المؤهلات">
                    {loading ? <p>جاري التحميل...</p> : (
                        <table className={styles.table}>
                            <thead>
                                <tr><th>النوع</th><th>التخصص</th><th>السنة</th><th>المستوى</th><th>الإجراءات</th></tr>
                            </thead>
                            <tbody>
                                {records.map(reg => (
                                    <tr key={reg.qualification_id}>
                                        <td>{reg.qualification_type}</td>
                                        <td>{reg.qualification_specialization}</td>
                                        <td>{reg.qualification_year}</td>
                                        <td>{reg.qualification_level}</td>
                                        <td>
                                            <button onClick={() => handleDelete(reg.qualification_id)} className={styles.delBtn}>حذف</button>
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

"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function CoursesPage() {
    const { activeEmployee } = useEmployee();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newData, setNewData] = useState({
        course_name: '', course_date: '', course_duration: '', course_organization: '', course_result: ''
    });

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/courses`);
            const data = await res.json();
            setRecords(data);
        } catch (error) {
            console.error('Fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(); }, [activeEmployee]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            setNewData({ course_name: '', course_date: '', course_duration: '', course_organization: '', course_result: '' });
            fetchRecords();
        } catch (error) { console.error('Save failed:', error); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
        try {
            await fetch(`http://localhost:5001/api/details/courses/${id}`, { method: 'DELETE' });
            fetchRecords();
        } catch (error) { console.error('Delete failed:', error); }
    };

    if (!activeEmployee) return <p>برجاء اختيار موظف أولاً.</p>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />
            <div className={styles.layout}>
                <Card title="إضافة دورة تدريبية">
                    <form onSubmit={handleAdd} className={styles.grid}>
                        <FormField label="اسم الدورة" value={newData.course_name} onChange={(e) => setNewData({ ...newData, course_name: e.target.value })} />
                        <FormField label="التاريخ" type="date" value={newData.course_date} onChange={(e) => setNewData({ ...newData, course_date: e.target.value })} />
                        <FormField label="المدة" value={newData.course_duration} onChange={(e) => setNewData({ ...newData, course_duration: e.target.value })} />
                        <FormField label="الجهة المنظمة" value={newData.course_organization} onChange={(e) => setNewData({ ...newData, course_organization: e.target.value })} />
                        <FormField label="النتيجة" value={newData.course_result} onChange={(e) => setNewData({ ...newData, course_result: e.target.value })} />
                        <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإضافة...' : 'إضافة دورة'}</button>
                    </form>
                </Card>
                <Card title="سجل الدورات">
                    {loading ? <p>جاري التحميل...</p> : (
                        <table className={styles.table}>
                            <thead>
                                <tr><th>الاسم</th><th>التاريخ</th><th>المدة</th><th>النتيجة</th><th>الإجراءات</th></tr>
                            </thead>
                            <tbody>
                                {records.map(reg => (
                                    <tr key={reg.course_id}>
                                        <td>{reg.course_name}</td>
                                        <td>{new Date(reg.course_date).toLocaleDateString()}</td>
                                        <td>{reg.course_duration}</td>
                                        <td>{reg.course_result}</td>
                                        <td>
                                            <button onClick={() => handleDelete(reg.course_id)} className={styles.delBtn}>حذف</button>
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

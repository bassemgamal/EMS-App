"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function CoursesPage() {
    const { activeEmployee } = useEmployee();
    const { hasRole } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newData, setNewData] = useState({
        course_name: '', course_date: '', course_duration: '', course_organization: '', course_result: ''
    });

    const canEdit = hasRole(['ADMIN', 'MANAGER']);
    const canDelete = hasRole(['ADMIN']);

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/courses`);
            const data = await res.json();
            setRecords(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(); }, [activeEmployee]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!canEdit) return;
        setSaving(true);
        try {
            await apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            setNewData({ course_name: '', course_date: '', course_duration: '', course_organization: '', course_result: '' });
            fetchRecords();
        } catch (error) { console.error('Save failed:', error); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!canDelete) return;
        if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
        try {
            await apiFetch(`http://localhost:5001/api/details/courses/${id}`, { method: 'DELETE' });
            fetchRecords();
        } catch (error) { console.error('Delete failed:', error); }
    };

    if (!activeEmployee) return <div className={styles.container}><p>برجاء اختيار موظف أولاً.</p></div>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />
            <div className={styles.layout}>
                <Card title="إضافة دورة تدريبية">
                    <form onSubmit={handleAdd} className={styles.grid}>
                        <FormField disabled={!canEdit} label="اسم الدورة" value={newData.course_name} onChange={(e) => setNewData({ ...newData, course_name: e.target.value })} />
                        <FormField disabled={!canEdit} label="التاريخ" type="date" value={newData.course_date} onChange={(e) => setNewData({ ...newData, course_date: e.target.value })} />
                        <FormField disabled={!canEdit} label="المدة" value={newData.course_duration} onChange={(e) => setNewData({ ...newData, course_duration: e.target.value })} />
                        <FormField disabled={!canEdit} label="الجهة المنظمة" value={newData.course_organization} onChange={(e) => setNewData({ ...newData, course_organization: e.target.value })} />
                        <FormField disabled={!canEdit} label="النتيجة" value={newData.course_result} onChange={(e) => setNewData({ ...newData, course_result: e.target.value })} />
                        {canEdit ? (
                            <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإضافة...' : 'إضافة دورة'}</button>
                        ) : (
                            <p className={styles.readonlyNote}>وضع العرض فقط</p>
                        )}
                    </form>
                </Card>
                <Card title="سجل الدورات">
                    {loading ? <p>جاري التحميل...</p> : (
                        <table className={styles.table}>
                            <thead>
                                <tr><th>الاسم</th><th>التاريخ</th><th>المدة</th><th>النتيجة</th>{canDelete && <th>الإجراءات</th>}</tr>
                            </thead>
                            <tbody>
                                {records.length > 0 ? records.map(reg => (
                                    <tr key={reg.course_id}>
                                        <td>{reg.course_name}</td>
                                        <td>{new Date(reg.course_date).toLocaleDateString()}</td>
                                        <td>{reg.course_duration}</td>
                                        <td>{reg.course_result}</td>
                                        {canDelete && (
                                            <td>
                                                <button onClick={() => handleDelete(reg.course_id)} className={styles.delBtn}>حذف</button>
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr><td colSpan={canDelete ? "5" : "4"} className={styles.noData}>لا يوجد سجلات</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </div>
    );
}

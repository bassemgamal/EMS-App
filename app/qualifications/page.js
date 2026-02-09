"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

const QUAL_TYPES = [
    { label: '--- اختر النوع ---', value: '' },
    { label: 'بكالوريوس', value: 'بكالوريوس' },
    { label: 'ليسانس', value: 'ليسانس' },
    { label: 'ماجستير', value: 'ماجستير' },
    { label: 'دكتوراه', value: 'دكتوراه' },
    { label: 'دبلوم', value: 'دبلوم' },
    { label: 'ثانوية عامة', value: 'ثانوية عامة' }
];

const QUAL_LEVEL_OPTIONS = [
    { label: '--- اختر المستوى ---', value: '' },
    { label: 'ممتاز', value: 'ممتاز' },
    { label: 'جيد جداً', value: 'جيد جداً' },
    { label: 'جيد', value: 'جيد' },
    { label: 'مقبول', value: 'مقبول' }
];

export default function QualificationsPage() {
    const { activeEmployee } = useEmployee();
    const { hasRole } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newData, setNewData] = useState({
        qualification_type: '', qualification_specialization: '',
        qualification_year: '', qualification_issuer: '', qualification_level: ''
    });

    const canEdit = hasRole(['ADMIN', 'MANAGER']);
    const canDelete = hasRole(['ADMIN']);

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/qualifications`);
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
            await apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/qualifications`, {
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
        if (!canDelete) return;
        if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
        try {
            await apiFetch(`http://localhost:5001/api/details/qualifications/${id}`, { method: 'DELETE' });
            fetchRecords();
        } catch (error) { console.error('Delete failed:', error); }
    };

    if (!activeEmployee) return <div className={styles.container}><p>برجاء اختيار موظف أولاً.</p></div>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />
            <div className={styles.layout}>
                <Card title="إضافة مؤهل">
                    <form onSubmit={handleAdd} className={styles.grid}>
                        <FormField disabled={!canEdit} label="النوع" type="select" options={QUAL_TYPES} value={newData.qualification_type} onChange={(e) => setNewData({ ...newData, qualification_type: e.target.value })} />
                        <FormField disabled={!canEdit} label="التخصص" value={newData.qualification_specialization} onChange={(e) => setNewData({ ...newData, qualification_specialization: e.target.value })} />
                        <FormField disabled={!canEdit} label="السنة" type="number" value={newData.qualification_year} onChange={(e) => setNewData({ ...newData, qualification_year: e.target.value })} />
                        <FormField disabled={!canEdit} label="جهة الصدور" value={newData.qualification_issuer} onChange={(e) => setNewData({ ...newData, qualification_issuer: e.target.value })} />
                        <FormField disabled={!canEdit} label="المستوى" type="select" options={QUAL_LEVEL_OPTIONS} value={newData.qualification_level} onChange={(e) => setNewData({ ...newData, qualification_level: e.target.value })} />
                        {canEdit ? (
                            <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإضافة...' : 'إضافة'}</button>
                        ) : (
                            <p className={styles.readonlyNote}>وضع العرض فقط</p>
                        )}
                    </form>
                </Card>
                <Card title="قائمة المؤهلات">
                    {loading ? <p>جاري التحميل...</p> : (
                        <table className={styles.table}>
                            <thead>
                                <tr><th>النوع</th><th>التخصص</th><th>السنة</th><th>المستوى</th>{canDelete && <th>الإجراءات</th>}</tr>
                            </thead>
                            <tbody>
                                {records.length > 0 ? records.map(reg => (
                                    <tr key={reg.qualification_id}>
                                        <td>{reg.qualification_type}</td>
                                        <td>{reg.qualification_specialization}</td>
                                        <td>{reg.qualification_year}</td>
                                        <td>{reg.qualification_level}</td>
                                        {canDelete && (
                                            <td>
                                                <button onClick={() => handleDelete(reg.qualification_id)} className={styles.delBtn}>حذف</button>
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr><td colSpan={canDelete ? "5" : "4"} className={styles.noData}>لا يوجد سجلات مؤهلات</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </div>
    );
}

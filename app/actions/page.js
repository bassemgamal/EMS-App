"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function ActionsPage() {
    const { activeEmployee } = useEmployee();
    const { hasRole } = useAuth();
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

    const canEdit = hasRole(['ADMIN', 'MANAGER']);
    const canDelete = hasRole(['ADMIN']);

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/actions`);
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
            await apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/actions`, {
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

    const handleDelete = async (id) => {
        if (!canDelete) return;
        if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
        try {
            await apiFetch(`http://localhost:5001/api/details/actions/${id}`, { method: 'DELETE' });
            fetchRecords();
        } catch (error) { console.error('Delete failed:', error); }
    };

    if (!activeEmployee) return <div className={styles.container}><p>برجاء اختيار موظف أولاً.</p></div>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />

            <Card title="إضافة إجراء قانوني">
                <form onSubmit={handleAdd} className={styles.grid}>
                    <FormField disabled={!canEdit} label="نوع الإجراء" value={newData.action_type} onChange={(e) => setNewData({ ...newData, action_type: e.target.value })} />
                    <FormField disabled={!canEdit} label="تاريخ الإحالة" type="date" value={newData.referral_date} onChange={(e) => setNewData({ ...newData, referral_date: e.target.value })} />
                    <FormField disabled={!canEdit} label="تاريخ القرار" type="date" value={newData.decision_date} onChange={(e) => setNewData({ ...newData, decision_date: e.target.value })} />
                    <FormField disabled={!canEdit} label="المدة (بالأيام)" type="number" value={newData.duration_days} onChange={(e) => setNewData({ ...newData, duration_days: e.target.value })} />
                    <FormField disabled={!canEdit} label="رقم الإجراء" value={newData.action_number} onChange={(e) => setNewData({ ...newData, action_number: e.target.value })} />
                    <FormField disabled={!canEdit} label="جهة الصدور" value={newData.authority} onChange={(e) => setNewData({ ...newData, authority: e.target.value })} />
                    <FormField disabled={!canEdit} label="الحالة" value={newData.status} onChange={(e) => setNewData({ ...newData, status: e.target.value })} />
                    <div className={styles.fullWidth}>
                        <FormField disabled={!canEdit} label="الوصف" type="textarea" value={newData.description} onChange={(e) => setNewData({ ...newData, description: e.target.value })} />
                    </div>
                    <div className={styles.fullWidth}>
                        <FormField disabled={!canEdit} label="الملاحظات" type="textarea" value={newData.notes} onChange={(e) => setNewData({ ...newData, notes: e.target.value })} />
                    </div>
                    {canEdit ? (
                        <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإضافة...' : 'إضافة إجراء'}</button>
                    ) : <p className={styles.readonlyNote}>وضع العرض فقط</p>}
                </form>
            </Card>

            <Card title="سجل الإجراءات">
                {loading ? <p>جاري التحميل...</p> : (
                    <div className={styles.tableResponsive}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>النوع</th>
                                    <th>رقم الإجراء</th>
                                    <th>تاريخ الإحالة</th>
                                    <th>تاريخ القرار</th>
                                    <th>المدة</th>
                                    <th>جهة الصدور</th>
                                    <th>الحالة</th>
                                    <th>الوصف</th>
                                    <th>الملاحظات</th>
                                    {canDelete && <th>الإجراءات</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {records.length > 0 ? records.map(reg => (
                                    <tr key={reg.action_id}>
                                        <td>{reg.action_type}</td>
                                        <td>{reg.action_number}</td>
                                        <td>{reg.referral_date ? new Date(reg.referral_date).toLocaleDateString('ar-EG') : '-'}</td>
                                        <td>{reg.decision_date ? new Date(reg.decision_date).toLocaleDateString('ar-EG') : '-'}</td>
                                        <td>{reg.duration_days} يوم</td>
                                        <td>{reg.authority}</td>
                                        <td>{reg.status}</td>
                                        <td><div className={styles.truncate}>{reg.description}</div></td>
                                        <td><div className={styles.truncate}>{reg.notes}</div></td>
                                        {canDelete && (
                                            <td>
                                                <button onClick={() => handleDelete(reg.action_id)} className={styles.delBtn}>حذف</button>
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr><td colSpan={canDelete ? "10" : "9"} className={styles.noData}>لا يوجد سجلات</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}

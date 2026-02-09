"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function AppointmentsPage() {
    const { activeEmployee } = useEmployee();
    const { hasRole } = useAuth();
    const [formData, setFormData] = useState({
        appointment_decision: '', appointment_decision_date: '', work_start_date: '',
        management_join_date: '', insurance_card_number: '', insurance_number: ''
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    };
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const canEdit = hasRole(['ADMIN', 'MANAGER']);

    useEffect(() => {
        if (activeEmployee) {
            setLoading(true);
            apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/appointments`)
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        setFormData({
                            ...data,
                            appointment_decision_date: formatDate(data.appointment_decision_date),
                            work_start_date: formatDate(data.work_start_date),
                            management_join_date: formatDate(data.management_join_date)
                        });
                    }
                })
                .catch(err => console.error('Fetch failed:', err))
                .finally(() => setLoading(false));
        }
    }, [activeEmployee]);

    const handleSave = async () => {
        if (!canEdit) return;
        setSaving(true);
        try {
            await apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/appointments`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            alert('تم حفظ البيانات بنجاح!');
        } catch (error) { console.error('Save failed:', error); } finally { setSaving(false); }
    };

    if (!activeEmployee) return <div className={styles.container}><p>برجاء اختيار موظف أولاً.</p></div>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />
            <Card title="بيانات التعيين والتأمينات" actions={
                canEdit ? (
                    <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                ) : <span className={styles.readonlyNote}>وضع العرض فقط</span>
            }>
                {loading ? <p>جاري التحميل...</p> : (
                    <div className={styles.grid}>
                        <FormField disabled={!canEdit} label="القرار" value={formData.appointment_decision} onChange={(e) => setFormData({ ...formData, appointment_decision: e.target.value })} />
                        <FormField disabled={!canEdit} label="تاريخ القرار" type="date" value={formData.appointment_decision_date} onChange={(e) => setFormData({ ...formData, appointment_decision_date: e.target.value })} />
                        <FormField disabled={!canEdit} label="تاريخ استلام العمل" type="date" value={formData.work_start_date} onChange={(e) => setFormData({ ...formData, work_start_date: e.target.value })} />
                        <FormField disabled={!canEdit} label="تاريخ الالتحاق بالإدارة" type="date" value={formData.management_join_date} onChange={(e) => setFormData({ ...formData, management_join_date: e.target.value })} />
                        <FormField disabled={!canEdit} label="رقم البطاقة التأمينية" value={formData.insurance_card_number} onChange={(e) => setFormData({ ...formData, insurance_card_number: e.target.value })} />
                        <FormField disabled={!canEdit} label="الرقم التأميني" value={formData.insurance_number} onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })} />
                    </div>
                )}
            </Card>
        </div>
    );
}

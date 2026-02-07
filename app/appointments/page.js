"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function AppointmentsPage() {
    const { activeEmployee } = useEmployee();
    const [formData, setFormData] = useState({
        appointment_decision: '', appointment_decision_date: '', work_start_date: '',
        management_join_date: '', insurance_card_number: '', insurance_number: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (activeEmployee) {
            setLoading(true);
            fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/appointments`)
                .then(res => res.json())
                .then(data => { if (data) setFormData(data); })
                .finally(() => setLoading(false));
        }
    }, [activeEmployee]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/appointments`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            alert('تم حفظ بيانات التعيين بنجاح!');
        } catch (error) { console.error('Save failed:', error); } finally { setSaving(false); }
    };

    if (!activeEmployee) return <p>برجاء اختيار موظف أولاً.</p>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />
            <Card title="بيانات التعيين والتأمينات" actions={
                <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
            }>
                {loading ? <p>Loading...</p> : (
                    <div className={styles.grid}>
                        <FormField label="القرار" value={formData.appointment_decision} onChange={(e) => setFormData({ ...formData, appointment_decision: e.target.value })} />
                        <FormField label="تاريخ القرار" type="date" value={formData.appointment_decision_date} onChange={(e) => setFormData({ ...formData, appointment_decision_date: e.target.value })} />
                        <FormField label="تاريخ استلام العمل" type="date" value={formData.work_start_date} onChange={(e) => setFormData({ ...formData, work_start_date: e.target.value })} />
                        <FormField label="تاريخ الالتحاق بالإدارة" type="date" value={formData.management_join_date} onChange={(e) => setFormData({ ...formData, management_join_date: e.target.value })} />
                        <FormField label="رقم البطاقة التأمينية" value={formData.insurance_card_number} onChange={(e) => setFormData({ ...formData, insurance_card_number: e.target.value })} />
                        <FormField label="الرقم التأميني" value={formData.insurance_number} onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })} />
                    </div>
                )}
            </Card>
        </div>
    );
}

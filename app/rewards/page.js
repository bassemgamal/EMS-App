"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function RewardsPage() {
    const { activeEmployee } = useEmployee();
    const { hasRole } = useAuth();
    const [formData, setFormData] = useState({
        encouraging_bonuses: '',
        ideal_employee_years: '',
        hajj_status_years: '',
        financial_approvals: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const canEdit = hasRole(['ADMIN', 'MANAGER']);

    useEffect(() => {
        if (activeEmployee) {
            setLoading(true);
            apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/rewards`)
                .then(res => res.json())
                .then(data => {
                    if (data) setFormData(data);
                })
                .catch(err => console.error('Fetch failed:', err))
                .finally(() => setLoading(false));
        }
    }, [activeEmployee]);

    const handleSave = async () => {
        if (!canEdit) return;
        setSaving(true);
        try {
            await apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/rewards`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            alert('تم حفظ البيانات بنجاح!');
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!activeEmployee) return <div className={styles.container}><p>برجاء اختيار موظف أولاً.</p></div>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />

            <Card title="المكافآت والحوافز" actions={
                canEdit ? (
                    <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                ) : <span className={styles.readonlyNote}>وضع العرض فقط</span>
            }>
                {loading ? <p>جاري التحميل...</p> : (
                    <div className={styles.grid}>
                        <FormField
                            disabled={!canEdit}
                            label="علاوات تشجيعية"
                            value={formData.encouraging_bonuses}
                            onChange={(e) => setFormData({ ...formData, encouraging_bonuses: e.target.value })}
                        />
                        <FormField
                            disabled={!canEdit}
                            label="سنوات الموظف المثالي"
                            value={formData.ideal_employee_years}
                            onChange={(e) => setFormData({ ...formData, ideal_employee_years: e.target.value })}
                        />
                        <FormField
                            disabled={!canEdit}
                            label="سنوات بعثة الحج"
                            value={formData.hajj_status_years}
                            onChange={(e) => setFormData({ ...formData, hajj_status_years: e.target.value })}
                        />
                        <FormField
                            disabled={!canEdit}
                            label="الموافقات المالية"
                            value={formData.financial_approvals}
                            onChange={(e) => setFormData({ ...formData, financial_approvals: e.target.value })}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}

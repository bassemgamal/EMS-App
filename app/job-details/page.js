"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function JobDetailsPage() {
    const { activeEmployee } = useEmployee();
    const { hasRole } = useAuth();
    const [formData, setFormData] = useState({
        assigned_work: '',
        functional_group: '',
        sub_functional_group: '',
        job_title: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const canEdit = hasRole(['ADMIN', 'MANAGER']);

    useEffect(() => {
        if (activeEmployee) {
            setLoading(true);
            apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/job-details`)
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
            await apiFetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/job-details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            alert('تم حفظ البيانات الوظيفية بنجاح!');
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

            <Card title="البيانات الوظيفية" actions={
                canEdit ? (
                    <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                ) : (
                    <span className={styles.readonlyNote}>وضع العرض فقط</span>
                )
            }>
                {loading ? <p>جاري التحميل...</p> : (
                    <div className={styles.grid}>
                        <FormField
                            disabled={!canEdit}
                            label="العمل المكلف به"
                            value={formData.assigned_work}
                            onChange={(e) => setFormData({ ...formData, assigned_work: e.target.value })}
                        />
                        <FormField
                            disabled={!canEdit}
                            label="المجموعة الوظيفية"
                            value={formData.functional_group}
                            onChange={(e) => setFormData({ ...formData, functional_group: e.target.value })}
                        />
                        <FormField
                            disabled={!canEdit}
                            label="المجموعة الوظيفية الفرعية"
                            value={formData.sub_functional_group}
                            onChange={(e) => setFormData({ ...formData, sub_functional_group: e.target.value })}
                        />
                        <FormField
                            disabled={!canEdit}
                            label="المسمى الوظيفي"
                            value={formData.job_title}
                            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}

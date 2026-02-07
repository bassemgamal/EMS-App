"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

export default function JobDetailsPage() {
    const { activeEmployee } = useEmployee();
    const [formData, setFormData] = useState({
        assigned_work: '',
        functional_group: '',
        sub_functional_group: '',
        job_title: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (activeEmployee) {
            setLoading(true);
            fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/job-details`)
                .then(res => res.json())
                .then(data => {
                    if (data) setFormData(data);
                })
                .finally(() => setLoading(false));
        }
    }, [activeEmployee]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/job-details`, {
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

    if (!activeEmployee) return <p>برجاء اختيار موظف أولاً.</p>;

    return (
        <div className={styles.container}>
            <EmployeeHeader />

            <Card title="البيانات الوظيفية" actions={
                <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
            }>
                {loading ? <p>جاري التحميل...</p> : (
                    <div className={styles.grid}>
                        <FormField
                            label="العمل المكلف به"
                            value={formData.assigned_work}
                            onChange={(e) => setFormData({ ...formData, assigned_work: e.target.value })}
                        />
                        <FormField
                            label="المجموعة الوظيفية"
                            value={formData.functional_group}
                            onChange={(e) => setFormData({ ...formData, functional_group: e.target.value })}
                        />
                        <FormField
                            label="المجموعة الوظيفية الفرعية"
                            value={formData.sub_functional_group}
                            onChange={(e) => setFormData({ ...formData, sub_functional_group: e.target.value })}
                        />
                        <FormField
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

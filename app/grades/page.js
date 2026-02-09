"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

const GRADE_LEVELS = [
    'الممتازة', 'العالية', 'مدير عام', 'الأولى (أ)', 'الأولى (ب)', 'الثانية (أ)', 'الثانية (ب)',
    'الثالثة (أ)', 'الثالثة (ب)', 'الثالثة (ج)', 'الرابعة (أ)', 'الرابعة (ب)', 'الخامسة (أ)',
    'الخامسة (ب)', 'السادسة (أ)', 'السادسة (ب)'
];

const GRADE_OPTIONS = [{ label: '--- اختر الدرجة ---', value: '' }, ...GRADE_LEVELS.map(g => ({ label: g, value: g }))];

export default function GradesPage() {
    const { activeEmployee } = useEmployee();
    const [gradeData, setGradeData] = useState({
        appointed_grade: '', appointed_grade_date: '',
        third_grade_date: '', settlement_date: '',
        previous_previous_grade: '', previous_grade: '',
        current_grade: '', initial_promotion_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return isNaN(d) ? '' : d.toISOString().split('T')[0];
    };

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/grades`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setGradeData({
                        appointed_grade: data.appointed_grade || '',
                        appointed_grade_date: formatDateForInput(data.appointed_grade_date),
                        third_grade_date: formatDateForInput(data.third_grade_date),
                        settlement_date: formatDateForInput(data.settlement_date),
                        previous_previous_grade: data.previous_previous_grade || '',
                        previous_grade: data.previous_grade || '',
                        current_grade: data.current_grade || '',
                        initial_promotion_date: formatDateForInput(data.initial_promotion_date)
                    });
                }
            }
        } catch (error) { console.error('Fetch failed:', error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRecords(); }, [activeEmployee]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/grades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gradeData)
            });
            if (res.ok) {
                alert('تم حفظ البيانات بنجاح');
                fetchRecords();
            } else {
                alert('فشل حفظ البيانات');
            }
        } catch (error) { console.error('Save failed:', error); } finally { setSaving(false); }
    };

    if (!activeEmployee) return <div className={styles.container}><p>برجاء اختيار موظف أولاً.</p></div>;

    const DisplayItem = ({ label, value, isDate }) => (
        <div className={styles.displayItem}>
            <span className={styles.displayLabel}>{label}:</span>
            <span className={styles.displayValue}>
                {isDate ? (value ? new Date(value).toLocaleDateString('ar-EG') : '---') : (value || '---')}
            </span>
        </div>
    );

    return (
        <div className={styles.container}>
            <EmployeeHeader />
            <div className={styles.layout}>
                <Card title="بيانات الدرجات الوظيفية">
                    <form onSubmit={handleSave} className={styles.grid}>
                        <FormField label="الدرجة المعين عليها" type="select" options={GRADE_OPTIONS} value={gradeData.appointed_grade} onChange={(e) => setGradeData({ ...gradeData, appointed_grade: e.target.value })} />
                        <FormField label="تاريخ أقدمية التعيين" type="date" value={gradeData.appointed_grade_date} onChange={(e) => setGradeData({ ...gradeData, appointed_grade_date: e.target.value })} />

                        <FormField label="تاريخ الدرجة الثالثة" type="date" value={gradeData.third_grade_date} onChange={(e) => setGradeData({ ...gradeData, third_grade_date: e.target.value })} />
                        <FormField label="تاريخ التسوية" type="date" value={gradeData.settlement_date} onChange={(e) => setGradeData({ ...gradeData, settlement_date: e.target.value })} />

                        <FormField label="الدرجة قبل السابقة" type="select" options={GRADE_OPTIONS} value={gradeData.previous_previous_grade} onChange={(e) => setGradeData({ ...gradeData, previous_previous_grade: e.target.value })} />
                        <FormField label="الدرجة السابقة" type="select" options={GRADE_OPTIONS} value={gradeData.previous_grade} onChange={(e) => setGradeData({ ...gradeData, previous_grade: e.target.value })} />

                        <FormField label="الدرجة الحالية" type="select" options={GRADE_OPTIONS} value={gradeData.current_grade} onChange={(e) => setGradeData({ ...gradeData, current_grade: e.target.value })} />
                        <FormField label="تاريخ الترقية" type="date" value={gradeData.initial_promotion_date} onChange={(e) => setGradeData({ ...gradeData, initial_promotion_date: e.target.value })} />

                        <div className={styles.formActions}>
                            <button type="submit" className={styles.saveBtn} disabled={saving}>
                                {saving ? 'جاري الحفظ...' : 'حفظ البيانات'}
                            </button>
                        </div>
                    </form>
                </Card>

                <Card title="ملخص التدرج الوظيفي">
                    {loading ? <p>جاري التحميل...</p> : (
                        <div className={styles.displayGrid}>
                            <DisplayItem label="الدرجة المعين عليها" value={gradeData.appointed_grade} />
                            <DisplayItem label="تاريخ أقدمية التعيين" value={gradeData.appointed_grade_date} isDate />
                            <DisplayItem label="تاريخ الدرجة الثالثة" value={gradeData.third_grade_date} isDate />
                            <DisplayItem label="تاريخ التسوية" value={gradeData.settlement_date} isDate />
                            <DisplayItem label="الدرجة قبل السابقة" value={gradeData.previous_previous_grade} />
                            <DisplayItem label="الدرجة السابقة" value={gradeData.previous_grade} />
                            <DisplayItem label="الدرجة الحالية" value={gradeData.current_grade} />
                            <DisplayItem label="تاريخ الترقية" value={gradeData.initial_promotion_date} isDate />
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

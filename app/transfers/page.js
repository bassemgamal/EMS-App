"use client";
import { useState, useEffect } from 'react';
import { useEmployee } from '@/context/EmployeeContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import Card from '@/components/Card';
import FormField from '@/components/FormField';
import styles from './page.module.css';

const GOVERNORATES = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'القليوبية', 'البحيرة', 'الغربية', 'بور سعيد', 'دمياط', 'الإسماعيلية', 'السويس', 'كفر الشيخ', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء'
];

export default function TransfersPage() {
    const { activeEmployee } = useEmployee();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form states for each section
    const [transferData, setTransferData] = useState({
        decision_number: '', transfer_date: '', to_workplace: '', governorate: 'القاهرة', region: '', decision_execution_date: ''
    });
    const [secondmentData, setSecondmentData] = useState({
        decision_number: '', transfer_date: '', to_workplace: ''
    });
    const [delegationData, setDelegationData] = useState({
        decision_number: '', transfer_date: '', delegation_type: 'داخلي', delegation_duration: '', to_workplace: ''
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    };

    const fetchRecords = async () => {
        if (!activeEmployee) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/transfers`);
            const data = await res.json();
            setRecords(Array.isArray(data) ? data : []);
        } catch (error) { console.error('Fetch failed:', error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRecords(); }, [activeEmployee]);

    const handleAdd = async (type, data, resetFn) => {
        setSaving(true);
        try {
            const payload = { ...data, transfer_type: type };
            const res = await fetch(`http://localhost:5001/api/details/${activeEmployee.employee_id}/transfers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                resetFn();
                fetchRecords();
            } else {
                alert('فشل إضافة السجل');
            }
        } catch (error) { console.error('Save failed:', error); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
        try {
            const res = await fetch(`http://localhost:5001/api/details/transfers/${id}`, { method: 'DELETE' });
            if (res.ok) fetchRecords();
        } catch (error) { console.error('Delete failed:', error); }
    };

    if (!activeEmployee) return <div className={styles.container}><p>برجاء اختيار موظف أولاً من الصفحة الرئيسية.</p></div>;

    const filteredRecords = (type) => records.filter(r => r.transfer_type === type);

    return (
        <div className={styles.container}>
            <EmployeeHeader />

            <div className={styles.sectionsContainer}>
                {/* 1. قسم النقل */}
                <Card title="قسم النقل">
                    <form onSubmit={(e) => { e.preventDefault(); handleAdd('نقل', transferData, () => setTransferData({ decision_number: '', transfer_date: '', to_workplace: '', governorate: 'القاهرة', region: '', decision_execution_date: '' })); }} className={styles.formSection}>
                        <div className={styles.grid}>
                            <FormField label="رقم القرار" value={transferData.decision_number} onChange={(e) => setTransferData({ ...transferData, decision_number: e.target.value })} required />
                            <FormField label="تاريخ القرار" type="date" value={transferData.transfer_date} onChange={(e) => setTransferData({ ...transferData, transfer_date: e.target.value })} required />
                            <FormField label="الجهة المنقول لها" value={transferData.to_workplace} onChange={(e) => setTransferData({ ...transferData, to_workplace: e.target.value })} required />
                            <FormField label="المحافظة" type="select" options={GOVERNORATES.map(g => ({ label: g, value: g }))} value={transferData.governorate} onChange={(e) => setTransferData({ ...transferData, governorate: e.target.value })} />
                            <FormField label="المنطقة" value={transferData.region} onChange={(e) => setTransferData({ ...transferData, region: e.target.value })} />
                            <FormField label="تاريخ التنفيذ" type="date" value={transferData.decision_execution_date} onChange={(e) => setTransferData({ ...transferData, decision_execution_date: e.target.value })} />
                        </div>
                        <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإضافة...' : 'إضافة قرار نقل'}</button>
                    </form>

                    <div className={styles.tableWrapper}>
                        <h4>قرارات النقل السابقة</h4>
                        <table className={styles.table}>
                            <thead>
                                <tr><th>رقم القرار</th><th>التاريخ</th><th>الجهة</th><th>المحافظة</th><th>الإجراءات</th></tr>
                            </thead>
                            <tbody>
                                {filteredRecords('نقل').map(r => (
                                    <tr key={r.transfer_id}>
                                        <td>{r.decision_number}</td>
                                        <td>{r.transfer_date ? new Date(r.transfer_date).toLocaleDateString('ar-EG') : 'N/A'}</td>
                                        <td>{r.to_workplace}</td>
                                        <td>{r.governorate}</td>
                                        <td><button onClick={() => handleDelete(r.transfer_id)} className={styles.delBtn}>حذف</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* 2. قسم الإعارة */}
                <Card title="قسم الإعارة">
                    <form onSubmit={(e) => { e.preventDefault(); handleAdd('اعارة', secondmentData, () => setSecondmentData({ decision_number: '', transfer_date: '', to_workplace: '' })); }} className={styles.formSection}>
                        <div className={styles.grid}>
                            <FormField label="رقم القرار" value={secondmentData.decision_number} onChange={(e) => setSecondmentData({ ...secondmentData, decision_number: e.target.value })} required />
                            <FormField label="تاريخ القرار" type="date" value={secondmentData.transfer_date} onChange={(e) => setSecondmentData({ ...secondmentData, transfer_date: e.target.value })} required />
                            <FormField label="الجهة المعار إليها" value={secondmentData.to_workplace} onChange={(e) => setSecondmentData({ ...secondmentData, to_workplace: e.target.value })} required />
                        </div>
                        <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإضافة...' : 'إضافة قرار إعارة'}</button>
                    </form>

                    <div className={styles.tableWrapper}>
                        <h4>قرارات الإعارة السابقة</h4>
                        <table className={styles.table}>
                            <thead>
                                <tr><th>رقم القرار</th><th>التاريخ</th><th>الجهة</th><th>الإجراءات</th></tr>
                            </thead>
                            <tbody>
                                {filteredRecords('اعارة').map(r => (
                                    <tr key={r.transfer_id}>
                                        <td>{r.decision_number}</td>
                                        <td>{r.transfer_date ? new Date(r.transfer_date).toLocaleDateString('ar-EG') : 'N/A'}</td>
                                        <td>{r.to_workplace}</td>
                                        <td><button onClick={() => handleDelete(r.transfer_id)} className={styles.delBtn}>حذف</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* 3. قسم الندب */}
                <Card title="قسم الندب">
                    <form onSubmit={(e) => { e.preventDefault(); handleAdd('ندب', delegationData, () => setDelegationData({ decision_number: '', transfer_date: '', delegation_type: 'داخلي', delegation_duration: '', to_workplace: '' })); }} className={styles.formSection}>
                        <div className={styles.grid}>
                            <FormField label="رقم القرار" value={delegationData.decision_number} onChange={(e) => setDelegationData({ ...delegationData, decision_number: e.target.value })} required />
                            <FormField label="تاريخ القرار" type="date" value={delegationData.transfer_date} onChange={(e) => setDelegationData({ ...delegationData, transfer_date: e.target.value })} required />
                            <FormField label="نوع الندب" type="select" options={[{ label: 'داخلي', value: 'داخلي' }, { label: 'خارجي', value: 'خارجي' }]} value={delegationData.delegation_type} onChange={(e) => setDelegationData({ ...delegationData, delegation_type: e.target.value })} />
                            <FormField label="مدة الندب" value={delegationData.delegation_duration} onChange={(e) => setDelegationData({ ...delegationData, delegation_duration: e.target.value })} />
                            <FormField label="جهة الندب" value={delegationData.to_workplace} onChange={(e) => setDelegationData({ ...delegationData, to_workplace: e.target.value })} required />
                        </div>
                        <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'جاري الإضافة...' : 'إضافة قرار ندب'}</button>
                    </form>

                    <div className={styles.tableWrapper}>
                        <h4>قرارات الندب السابقة</h4>
                        <table className={styles.table}>
                            <thead>
                                <tr><th>رقم القرار</th><th>التاريخ</th><th>النوع</th><th>المدة</th><th>الجهة</th><th>الإجراءات</th></tr>
                            </thead>
                            <tbody>
                                {filteredRecords('ندب').map(r => (
                                    <tr key={r.transfer_id}>
                                        <td>{r.decision_number}</td>
                                        <td>{r.transfer_date ? new Date(r.transfer_date).toLocaleDateString('ar-EG') : 'N/A'}</td>
                                        <td>{r.delegation_type}</td>
                                        <td>{r.delegation_duration}</td>
                                        <td>{r.to_workplace}</td>
                                        <td><button onClick={() => handleDelete(r.transfer_id)} className={styles.delBtn}>حذف</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}

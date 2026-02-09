"use client";
import React from 'react';
import styles from './MasterFile.module.css';

const MasterFile = ({ employee, details }) => {
    if (!employee) return (
        <div className={styles.noData}>لم يتم العثور على بيانات الموظف</div>
    );

    return (
        <div className={styles.masterFile}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerRight}>
                    <div className={styles.orgInfo}>
                        <div>
                            <h2>وزارة الموارد البشرية</h2>
                            <h3>قطاع الشؤون الإدارية</h3>
                            <p>إدارة السجلات والبيانات</p>
                        </div>
                    </div>
                </div>
                <div className={styles.headerCenter}>
                    <h1>بيان الحالة الوظيفية</h1>
                    <p>(نسخة رسمية مستخرجة من النظام)</p>
                </div>
                <div className={styles.headerLeft}>
                    <div className={styles.qrCode}>
                        <div className={styles.qrPlaceholder}>
                            <div className={styles.qrInner}></div>
                        </div>
                        <span className={styles.qrLabel}>التحقق الرقمي</span>
                    </div>
                    <div className={styles.docInfo}>
                        <p>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}</p>
                        <p>كود الموظف: {employee.employee_id}</p>
                    </div>
                </div>
            </header>

            {/* Employee Basic Section */}
            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <span>1. البيانات الأساسية</span>
                </div>
                <div className={styles.grid}>
                    <div className={styles.row}>
                        <div className={styles.cell}><span className={styles.label}>الاسـم بالكامل:</span> {employee.full_name}</div>
                        <div className={styles.cell}><span className={styles.label}>الرقم القومي:</span> {employee.national_id}</div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.cell}>
                            <span className={styles.label}>تاريخ الميلاد:</span>
                            {employee.birth_date ? new Date(employee.birth_date).toLocaleDateString('ar-EG') : '---'}
                        </div>
                        <div className={styles.cell}><span className={styles.label}>النوع:</span> {employee.gender}</div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.cell}><span className={styles.label}>العنوان:</span> {employee.address}</div>
                        <div className={styles.cell}><span className={styles.label}>رقم الهاتف:</span> {employee.phone_number}</div>
                    </div>
                </div>
            </section>

            {/* Job Details Section */}
            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <span>2. الحالة الوظيفية الحالية</span>
                </div>
                <div className={styles.grid}>
                    <div className={styles.row}>
                        <div className={styles.cell}><span className={styles.label}>الوظيفة:</span> {details?.job?.job_title || '---'}</div>
                        <div className={styles.cell}><span className={styles.label}>الإدارة:</span> {details?.job?.department || '---'}</div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.cell}><span className={styles.label}>المجموعة الوظيفية:</span> {details?.job?.functional_group || '---'}</div>
                        <div className={styles.cell}><span className={styles.label}>تاريخ التعيين:</span> {details?.job?.hiring_date ? new Date(details?.job?.hiring_date).toLocaleDateString('ar-EG') : '---'}</div>
                    </div>
                </div>
            </section>

            {/* History Tables */}
            <div className={styles.tablesRow}>
                <div className={styles.tableCol}>
                    <h4>آخر التدرجات الوظيفية</h4>
                    <table className={styles.printTable}>
                        <thead>
                            <tr>
                                <th>الدرجة</th>
                                <th>تاريخ القرار</th>
                                <th>نوع الدرجة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details?.grades?.length > 0 ? details.grades.slice(0, 3).map((g, i) => (
                                <tr key={i}>
                                    <td>{g.current_grade}</td>
                                    <td>{g.appointed_grade_date ? new Date(g.appointed_grade_date).toLocaleDateString('ar-EG') : '---'}</td>
                                    <td>{g.appointed_grade}</td>
                                </tr>
                            )) : <tr><td colSpan="3">لا يوجد سجلات</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className={styles.tableCol}>
                    <h4>آخر تقييمات الأداء</h4>
                    <table className={styles.printTable}>
                        <thead>
                            <tr>
                                <th>تاريخ التقييم</th>
                                <th>الدرجة</th>
                                <th>ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details?.performance?.length > 0 ? details.performance.slice(0, 3).map((p, i) => (
                                <tr key={i}>
                                    <td>{new Date(p.evaluation_date).toLocaleDateString('ar-EG')}</td>
                                    <td>{p.score}%</td>
                                    <td>{p.notes || '---'}</td>
                                </tr>
                            )) : <tr><td colSpan="3">لا يوجد سجلات</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notes & Seal */}
            <footer className={styles.footer}>
                <div className={styles.notes}>
                    <p>ملاحظات هامة:</p>
                    <ul>
                        <li>تم استخراج هذا البيان بناءً على طلب صاحب الشأن وتحت مسئوليته.</li>
                        <li>لا يعتد بهذا البيان بدون الختم الرسمي للجهة.</li>
                    </ul>
                </div>
                <div className={styles.signatures}>
                    <div className={styles.signBox}>
                        <p>عن قسم السجلات</p>
                        <div className={styles.line}></div>
                    </div>
                    <div className={styles.signBox}>
                        <p>يعتمد مديـر الإدارة</p>
                        <div className={styles.line}></div>
                    </div>
                    <div className={styles.sealBox}>
                        <p>ختم شعار الجمهورية</p>
                        <div className={styles.circle}></div>
                    </div>
                </div>
            </footer>

            <div className={styles.pageNumber}>
                صفحة 1 من 1
            </div>
        </div>
    );
};

export default MasterFile;

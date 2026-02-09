"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployee } from '@/context/EmployeeContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import Card from '@/components/Card';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { setActiveEmployee } = useEmployee();
  const { user, hasRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Role Checks
  const canAdd = hasRole(['ADMIN', 'MANAGER']);
  const canDelete = hasRole(['ADMIN']); // Admins only for deletion for safety

  const statusMap = {
    'عامل': 'عامل',
    'معار': 'معار',
    'منتدب': 'منتدب',
    'متقاعد': 'متقاعد'
  };

  const statusClassMap = {
    'عامل': 'active',
    'معار': 'delegated',
    'منتدب': 'delegated',
    'متقاعد': 'retired'
  };

  const genderMap = { 'Male': 'ذكر', 'Female': 'أنثى', 'ذكر': 'ذكر', 'أنثى': 'أنثى' };
  const religionMap = { 'Muslim': 'مسلم', 'Christian': 'مسيحي', 'مسلم': 'مسلم', 'مسيحي': 'مسيحي' };
  const maritalStatusMap = {
    'Single': 'أعزب', 'Married': 'متزوج', 'Divorced': 'مطلق', 'Widowed': 'أرمل',
    'أعزب': 'أعزب', 'متزوج': 'متزوج', 'مطلق': 'مطلق', 'أرمل': 'أرمل'
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    serial_number: '',
    full_name: '',
    national_id: '',
    employment_status: 'عامل',
    file_reference: '',
    address: '',
    birth_date: '',
    gender: 'ذكر',
    religion: 'مسلم',
    phone_number: '',
    marital_status: 'أعزب'
  });

  const fetchEmployees = async (query = '') => {
    setLoading(true);
    try {
      const url = query
        ? `http://localhost:5001/api/employees/search?q=${query}`
        : `http://localhost:5001/api/employees`;
      const res = await apiFetch(url);
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(searchQuery);
  };

  const handleViewDetails = (emp) => {
    setActiveEmployee(emp);
    router.push('/job-details');
  };

  const handleDelete = async (id) => {
    if (!canDelete) return;
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        const res = await apiFetch(`http://localhost:5001/api/employees/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchEmployees(searchQuery);
        } else {
          alert('فشل حذف الموظف');
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('http://localhost:5001/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewEmployee({
          serial_number: '',
          full_name: '',
          national_id: '',
          employment_status: 'عامل',
          file_reference: '',
          address: '',
          birth_date: '',
          gender: 'ذكر',
          religion: 'مسلم',
          phone_number: '',
          marital_status: 'أعزب'
        });
        fetchEmployees();
      } else {
        alert('فشل إضافة الموظف');
      }
    } catch (error) {
      console.error('Add failed:', error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>الموظفين</h1>
          <p>إدارة والبحث عن الموظفين في النظام</p>
        </div>
        {canAdd && (
          <button
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            + إضافة موظف جديد
          </button>
        )}
      </header>

      <Card>
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <input
            type="text"
            placeholder="بحث بالاسم، الرقم المسلسل، أو الرقم القومي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>بحث</button>
        </form>
      </Card>

      <Card title="قائمة الموظفين">
        {loading ? (
          <div className={styles.loading}>جاري تحميل الموظفين...</div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>المسلسل</th>
                  <th>الاسم بالكامل</th>
                  <th>الرقم القومي</th>
                  <th>الحالة</th>
                  <th>ملف الحفظ</th>
                  <th>محل الإقامة</th>
                  <th>تاريخ الميلاد</th>
                  <th>النوع</th>
                  <th>الديانة</th>
                  <th>التليفون</th>
                  <th>الحالة الاجتماعية</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? employees.map((emp) => (
                  <tr key={emp.employee_id}>
                    <td>{emp.serial_number}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.national_id}</td>
                    <td>
                      <span className={`${styles.status} ${styles[statusClassMap[emp.employment_status]]}`}>
                        {statusMap[emp.employment_status] || emp.employment_status || 'N/A'}
                      </span>
                    </td>
                    <td>{emp.file_reference}</td>
                    <td>{emp.address}</td>
                    <td>{emp.birth_date ? new Date(emp.birth_date).toLocaleDateString('ar-EG') : 'N/A'}</td>
                    <td>{genderMap[emp.gender] || emp.gender}</td>
                    <td>{religionMap[emp.religion] || emp.religion}</td>
                    <td>{emp.phone_number}</td>
                    <td>{maritalStatusMap[emp.marital_status] || emp.marital_status}</td>
                    <td className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleViewDetails(emp)}
                      >
                        عرض التفاصيل
                      </button>
                      {canDelete && (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(emp.employee_id)}
                        >
                          حذف
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="12" className={styles.noData}>لم يتم العثور على موظفين</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>إضافة موظف جديد</h2>
            <form onSubmit={handleAddEmployee} className={styles.addForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>الرقم المسلسل</label>
                  <input
                    required
                    value={newEmployee.serial_number}
                    onChange={e => setNewEmployee({ ...newEmployee, serial_number: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>الاسم بالكامل</label>
                  <input
                    required
                    value={newEmployee.full_name}
                    onChange={e => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>الرقم القومي</label>
                  <input
                    required
                    maxLength="14"
                    value={newEmployee.national_id}
                    onChange={e => setNewEmployee({ ...newEmployee, national_id: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>حالة العمل</label>
                  <select
                    value={newEmployee.employment_status}
                    onChange={e => setNewEmployee({ ...newEmployee, employment_status: e.target.value })}
                  >
                    <option value="عامل">عامل</option>
                    <option value="معار">معار</option>
                    <option value="منتدب">منتدب</option>
                    <option value="متقاعد">متقاعد</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={newEmployee.birth_date}
                    onChange={e => setNewEmployee({ ...newEmployee, birth_date: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>النوع</label>
                  <select
                    value={newEmployee.gender}
                    onChange={e => setNewEmployee({ ...newEmployee, gender: e.target.value })}
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>الديانة</label>
                  <select
                    value={newEmployee.religion}
                    onChange={e => setNewEmployee({ ...newEmployee, religion: e.target.value })}
                  >
                    <option value="مسلم">مسلم</option>
                    <option value="مسيحي">مسيحي</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>الحالة الاجتماعية</label>
                  <select
                    value={newEmployee.marital_status}
                    onChange={e => setNewEmployee({ ...newEmployee, marital_status: e.target.value })}
                  >
                    <option value="أعزب">أعزب</option>
                    <option value="متزوج">متزوج</option>
                    <option value="مطلق">مطلق</option>
                    <option value="أرمل">أرمل</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>ملف الحفظ</label>
                  <input
                    value={newEmployee.file_reference}
                    onChange={e => setNewEmployee({ ...newEmployee, file_reference: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>محل الإقامة</label>
                  <input
                    value={newEmployee.address}
                    onChange={e => setNewEmployee({ ...newEmployee, address: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>رقم التليفون</label>
                  <input
                    type="tel"
                    value={newEmployee.phone_number}
                    onChange={e => setNewEmployee({ ...newEmployee, phone_number: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn}>إضافة</button>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

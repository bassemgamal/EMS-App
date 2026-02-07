"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployee } from '@/context/EmployeeContext';
import Card from '@/components/Card';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { setActiveEmployee } = useEmployee();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async (query = '') => {
    setLoading(true);
    try {
      const url = query
        ? `http://localhost:5001/api/employees/search?q=${query}`
        : `http://localhost:5001/api/employees`;
      const res = await fetch(url);
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>الموظفين</h1>
          <p>إدارة والبحث عن الموظفين في النظام</p>
        </div>
        <button className={styles.addButton}>+ إضافة موظف جديد</button>
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
          <table className={styles.table}>
            <thead>
              <tr>
                <th>المسلسل</th>
                <th>الاسم بالكامل</th>
                <th>الرقم القومي</th>
                <th>الحالة</th>
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
                    <span className={`${styles.status} ${styles[emp.employment_status?.toLowerCase()]}`}>
                      {emp.employment_status || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleViewDetails(emp)}
                    >
                      عرض التفاصيل
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className={styles.noData}>لم يتم العثور على موظفين</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

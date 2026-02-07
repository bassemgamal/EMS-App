import { EmployeeProvider } from '@/context/EmployeeContext';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata = {
  title: 'Employee Management System',
  description: 'Complete Analysis and Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <EmployeeProvider>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{
              marginRight: '260px',
              flex: 1,
              minHeight: '100vh',
              background: 'var(--bg-main)',
              padding: '2rem'
            }}>
              <div className="animate-fade-in">
                {children}
              </div>
            </main>
          </div>
        </EmployeeProvider>
      </body>
    </html>
  );
}

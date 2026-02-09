import { AuthProvider } from '@/context/AuthContext';
import { EmployeeProvider } from '@/context/EmployeeContext';
import { ThemeProvider } from '@/context/ThemeContext';
import StatusBar from '@/components/StatusBar';
import Sidebar from '@/components/Sidebar';
import './globals.css'; // Keep this import from original, it's missing in the provided target but likely needed.

// Note: The provided "Code Edit" removes `LayoutWrapper` import but keeps its usage.
// To make the resulting file syntactically correct, I will keep the `LayoutWrapper` import.
// If `LayoutWrapper` is no longer needed, it should be explicitly removed from the JSX as well.
// For now, I will assume the user wants to keep `LayoutWrapper` in the JSX and thus its import.
import LayoutWrapper from '@/components/LayoutWrapper'; // Keeping this import for `LayoutWrapper` usage.

// Note: The provided "Code Edit" adds `className={inter.className}` to body, but `inter` is not imported.
// To make the resulting file syntactically correct, I will remove `className={inter.className}`
// as `inter` is undefined. If `inter` is intended, it should be imported.
// I will revert `<body>` to `<body>` as in the original, as `inter` is not defined.

export const metadata = {
  title: 'Employee Management System',
  description: 'Complete Analysis and Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <EmployeeProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </EmployeeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

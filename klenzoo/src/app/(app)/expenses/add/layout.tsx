// The add expense page uses the standard (app) layout.
// TopBar receives showClose via the page title route — no custom shell needed.
export default function AddExpenseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}


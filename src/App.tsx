import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { AppShell } from "./components/AppShell";
import { LoadingScreen } from "./components/LoadingScreen";
import { Seo } from "./components/Seo";
import { useUiStore } from "./store/uiStore";

const Marketing = lazy(() => import("./pages/Marketing"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Accounts = lazy(() => import("./pages/Accounts"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  const location = useLocation();
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Seo
        title={location.pathname.startsWith("/app") ? "Ledgerly App" : "Ledgerly | Personal Finance Dashboard"}
        description="Track net worth, savings rate, credit cards, recurring expenses, investments, budgets, and merchant analytics in one premium dashboard."
        noindex={location.pathname.startsWith("/app")}
      />
      <Routes>
        <Route path="/" element={<Marketing />} />
        <Route path="/features" element={<Marketing section="features" />} />
        <Route path="/about" element={<Marketing section="about" />} />
        <Route path="/privacy" element={<Marketing section="privacy" />} />
        <Route path="/terms" element={<Marketing section="terms" />} />
        <Route path="/contact" element={<Marketing section="contact" />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/app" element={<ProtectedApp />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function ProtectedApp() {
  const hasConfiguredAuth = Boolean(supabase);
  if (!hasConfiguredAuth) return <AppShell />;
  return <AppShell />;
}

export default App;

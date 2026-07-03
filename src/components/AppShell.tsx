import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, CreditCard, Landmark, LayoutDashboard, LogOut, Menu, Moon, PieChart, ReceiptText, Settings, Sun, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useUiStore } from "../store/uiStore";
import { useAuthSession } from "../lib/auth";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const navigation = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/transactions", label: "Transactions", icon: ReceiptText },
  { to: "/app/accounts", label: "Accounts", icon: Landmark },
  { to: "/app/budgets", label: "Budgets", icon: PieChart },
  { to: "/app/reports", label: "Reports", icon: BarChart3 },
  { to: "/app/settings", label: "Settings", icon: Settings }
];

export function AppShell() {
  const navigate = useNavigate();
  const { theme, setTheme, sidebarOpen, toggleSidebar } = useUiStore();
  const { session } = useAuthSession();

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    navigate("/auth");
  }

  return (
    <div className="app-frame">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} aria-label="Primary navigation">
        <div className="brand-row">
          <div className="brand-mark"><CreditCard size={18} /></div>
          <span>Ledgerly</span>
        </div>
        <nav className="nav-list">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="nav-item" onClick={() => sidebarOpen && toggleSidebar()}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button className="icon-button mobile-only" type="button" aria-label="Open navigation" onClick={toggleSidebar}>
            <Menu size={18} />
          </button>
          <div>
            <p className="eyebrow">Personal finance command center</p>
            <h1>Money, cards, budgets, and investments</h1>
          </div>
          <div className="topbar-actions">
            {!isSupabaseConfigured && <Link className="auth-status demo" to="/auth"><UserCircle size={16} /> Preview mode</Link>}
            {isSupabaseConfigured && session && (
              <button className="auth-status" type="button" onClick={signOut}>
                <LogOut size={16} /> Sign out
              </button>
            )}
            <button className="icon-button" type="button" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <motion.main className="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

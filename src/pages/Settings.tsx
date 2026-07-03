import { Download, Shield, Trash2, Upload } from "lucide-react";
import { useUiStore } from "../store/uiStore";
import { Section } from "../components/Section";

export default function Settings() {
  const { theme, setTheme } = useUiStore();

  return (
    <div className="page-stack">
      <Section title="Preferences">
        <div className="settings-grid">
          <label>Currency<select defaultValue="INR"><option value="INR">Indian Rupee</option><option value="USD">US Dollar</option></select></label>
          <label>Locale<select defaultValue="en-IN"><option value="en-IN">English India</option><option value="en-US">English US</option></select></label>
          <label>Theme<select value={theme} onChange={(event) => setTheme(event.target.value as "dark" | "light")}><option value="dark">Dark</option><option value="light">Light</option></select></label>
        </div>
      </Section>
      <Section title="Data">
        <div className="action-list">
          <button className="ghost-button"><Download size={16} /> Export data</button>
          <button className="ghost-button"><Upload size={16} /> Import data</button>
          <button className="ghost-button"><Shield size={16} /> Backup settings</button>
          <button className="danger-button"><Trash2 size={16} /> Delete account</button>
        </div>
      </Section>
    </div>
  );
}

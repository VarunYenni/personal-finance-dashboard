import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "green" | "red" | "amber" | "blue";
}

export function KpiCard({ label, value, detail, icon: Icon, tone = "blue" }: KpiCardProps) {
  return (
    <article className={`kpi-card tone-${tone}`}>
      <div className="kpi-icon"><Icon size={19} /></div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

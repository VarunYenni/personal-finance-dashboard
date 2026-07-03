import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Lock, PieChart, WalletCards } from "lucide-react";

interface MarketingProps {
  section?: "features" | "about" | "privacy" | "terms" | "contact";
}

export default function Marketing({ section }: MarketingProps) {
  return (
    <main className="marketing-page">
      <nav className="marketing-nav" aria-label="Public navigation">
        <Link className="brand-row public" to="/"><span className="brand-mark"><WalletCards size={18} /></span>Ledgerly</Link>
        <div>
          <Link to="/features">Features</Link>
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/auth" className="nav-cta">Sign in</Link>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Dark mode finance OS</p>
          <h1>Ledgerly</h1>
          <p>Net worth, cards, budgets, merchants, recurring spends, and investments in one fast dashboard built for serious personal finance.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/auth">Open dashboard <ArrowRight size={16} /></Link>
            <Link className="ghost-button" to="/features">View features</Link>
          </div>
        </div>
        <div className="hero-panel" aria-label="Product preview">
          <div className="preview-line"><span>Net worth</span><strong>₹31.2L</strong></div>
          <div className="preview-bars"><i /><i /><i /><i /><i /></div>
          <div className="preview-grid">
            <span>Food ₹22K</span><span>Cards 6%</span><span>Savings 47%</span><span>SIP ₹75K</span>
          </div>
        </div>
      </section>
      <section className="public-section" id="features">
        <h2>{section ? sectionTitle(section) : "Everything a finance dashboard should answer"}</h2>
        <div className="feature-grid">
          {[
            { title: "True accounting", body: "Every transaction affects an account and category. Card payments reduce liability without double-counting expense.", Icon: CheckCircle2 },
            { title: "Cards and banks", body: "Track balances, utilization, due dates, statement cycles, rewards, and most-used cards.", Icon: WalletCards },
            { title: "Reports and budgets", body: "Monthly and yearly summaries, merchant analytics, savings rate, cash flow, and budget alerts.", Icon: PieChart },
            { title: "Supabase secure", body: "Auth, RLS policies, storage-ready receipts, realtime-ready data, and no server to maintain.", Icon: Lock }
          ].map(({ title, body, Icon }) => (
            <article className="feature-card" key={title}>
              <Icon size={22} />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function sectionTitle(section: NonNullable<MarketingProps["section"]>) {
  return {
    features: "Features",
    about: "About Ledgerly",
    privacy: "Privacy policy",
    terms: "Terms of service",
    contact: "Contact"
  }[section];
}

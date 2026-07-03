import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Chrome, LogIn, Mail, WalletCards } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function signInWithEmail() {
    if (!isSupabaseConfigured || !supabase) {
      navigate("/app");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/app` } });
    setMessage(error ? error.message : "Check your email for a secure sign-in link.");
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured || !supabase) {
      navigate("/app");
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/app` } });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand-row public" to="/"><span className="brand-mark"><WalletCards size={18} /></span>Ledgerly</Link>
        <h1>Sign in to your dashboard</h1>
        <p>Use Supabase email magic links or Google OAuth. Without environment keys, demo mode opens instantly.</p>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        </label>
        <button className="primary-button full" type="button" onClick={signInWithEmail}><Mail size={16} /> Email login</button>
        <button className="ghost-button full" type="button" onClick={signInWithGoogle}><Chrome size={16} /> Google login</button>
        <button className="text-button" type="button" onClick={() => navigate("/app")}><LogIn size={16} /> Continue in demo mode</button>
        {message && <p className="form-message">{message}</p>}
      </section>
    </main>
  );
}

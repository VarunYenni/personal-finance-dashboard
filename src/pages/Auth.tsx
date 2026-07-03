import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Chrome, Eye, EyeOff, Loader2, LogIn, Mail, WalletCards } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { useAuthSession } from "../lib/auth";

type AuthMode = "signin" | "signup";
type LoadingAction = "password" | "google" | "reset" | null;

export default function Auth() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  useEffect(() => {
    if (session) navigate("/app");
  }, [navigate, session]);

  async function handlePasswordAuth() {
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setMessage("Sign in is not available in this preview. You can continue in preview mode.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoadingAction("password");
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/app` }
        });

    setLoadingAction(null);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Account created. Check your email to confirm your account, then sign in.");
      return;
    }

    navigate("/app");
  }

  async function resetPassword() {
    setMessage("");

    if (!email) {
      setMessage("Enter your email first.");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setMessage("Password reset is not available in this preview.");
      return;
    }

    setLoadingAction("reset");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`
    });
    setLoadingAction(null);
    setMessage(error ? error.message : "Password reset email sent.");
  }

  async function signInWithGoogle() {
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setMessage("Google login is not available in this preview.");
      return;
    }

    setLoadingAction("google");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app` }
    });
    setLoadingAction(null);
    if (error) setMessage(error.message);
  }

  const isPasswordLoading = loadingAction === "password";
  const isBusy = loadingAction !== null;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand-row public" to="/"><span className="brand-mark"><WalletCards size={18} /></span>Ledgerly</Link>
        <div>
          <h1>{mode === "signin" ? "Sign in to Ledgerly" : "Create your Ledgerly account"}</h1>
          <p>Use your email and password to access your private finance workspace.</p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button>
        </div>

        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
        </label>
        <label>
          Password
          <span className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
            <button className="icon-button" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>

        <button className="primary-button full" type="button" onClick={handlePasswordAuth} disabled={isBusy || !email || !password}>
          {isPasswordLoading ? <Loader2 className="spin-icon" size={16} /> : <Mail size={16} />}
          {isPasswordLoading ? (mode === "signin" ? "Signing in" : "Creating account") : (mode === "signin" ? "Sign in" : "Create account")}
        </button>

        <button className="ghost-button full" type="button" onClick={signInWithGoogle} disabled={isBusy}>
          {loadingAction === "google" ? <Loader2 className="spin-icon" size={16} /> : <Chrome size={16} />}
          Google login
        </button>

        <div className="auth-actions">
          <button className="text-button" type="button" onClick={resetPassword} disabled={isBusy}>
            {loadingAction === "reset" ? <Loader2 className="spin-icon" size={15} /> : null}
            Forgot password
          </button>
          {!isSupabaseConfigured && (
            <button className="text-button" type="button" onClick={() => navigate("/app")}>
              <LogIn size={16} /> Continue in preview mode
            </button>
          )}
        </div>

        {!isSupabaseConfigured && <p className="demo-note">Preview mode is active. Changes are temporary in this environment.</p>}
        {message && <p className="form-message">{message}</p>}
      </section>
    </main>
  );
}

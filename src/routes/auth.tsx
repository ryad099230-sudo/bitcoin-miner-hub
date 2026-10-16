import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/site/PasswordInput";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { authErrorMessage, passwordIssues } from "@/lib/auth-errors";

const search = z.object({
  mode: z.enum(["login", "signup", "forgot"]).optional(),
  ref: z.string().max(16).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول / إنشاء حساب — Nova Invest" },
      { name: "description", content: "Log in or create your Nova Invest account." },
      { property: "og:title", content: "Login — Nova Invest" },
      { property: "og:description", content: "Log in or create your Nova Invest account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "login", ref } = Route.useSearch();
  const { t, tx, lang } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [refCode, setRefCode] = useState(ref ?? "");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (ref) localStorage.setItem("ref_code", ref);
    else if (!refCode) setRefCode(localStorage.getItem("ref_code") ?? "");
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, authLoading, navigate]);

  const emailOk = z.string().email().safeParse(email.trim()).success;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!emailOk) return setError(tx("أدخل بريداً إلكترونياً صحيحاً.", "Enter a valid email."));
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success(tx("تم تسجيل الدخول", "Signed in"));
        navigate({ to: "/dashboard", replace: true });
      } else if (mode === "signup") {
        if (name.trim().length < 2) throw new Error(tx("أدخل اسمك الكامل.", "Enter your full name."));
        const pwErr = passwordIssues(password, lang);
        if (pwErr) throw new Error(pwErr);
        if (password !== confirm) throw new Error(tx("كلمتا المرور غير متطابقتين.", "Passwords do not match."));
        if (!agree) throw new Error(tx("يجب الموافقة على الشروط وسياسة الخصوصية.", "You must accept the Terms and Privacy Policy."));
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: name.trim().slice(0, 100), referral_code: refCode.trim().toUpperCase().slice(0, 16) },
          },
        });
        if (error) throw error;
        if (data.user && data.user.identities?.length === 0) throw new Error("already registered");
        localStorage.removeItem("ref_code");
        if (data.session) navigate({ to: "/dashboard", replace: true });
        else setSentTo(email.trim());
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error;
        setSentTo(email.trim());
      }
    } catch (err) {
      const raw = (err as Error).message;
      setError(raw && !/[a-z]{4}/i.test(raw.slice(0, 4)) ? raw : authErrorMessage(err, lang));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!sentTo) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: sentTo, options: { emailRedirectTo: window.location.origin + "/dashboard" } });
    setBusy(false);
    if (error) toast.error(authErrorMessage(error, lang));
    else toast.success(tx("أُعيد إرسال الرسالة", "Email resent"));
  };

  if (sentTo) {
    return (
      <div className="container-page grid min-h-[70vh] place-items-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card-gradient p-8 text-center shadow-card">
          <MailCheck className="mx-auto size-12 text-primary" />
          <h1 className="mt-4 text-2xl font-bold">{tx("تحقق من بريدك", "Check your email")}</h1>
          <p className="mt-3 text-muted-foreground">
            {mode === "forgot"
              ? tx(`إذا كان هناك حساب مرتبط بـ ${sentTo} فستصلك رسالة لإعادة تعيين كلمة المرور.`, `If an account exists for ${sentTo}, you'll receive a reset link.`)
              : tx(`أرسلنا رابط تأكيد إلى ${sentTo}. افتحه لتفعيل حسابك.`, `We sent a confirmation link to ${sentTo}. Open it to activate your account.`)}
          </p>
          {mode === "signup" && <Button variant="secondary" className="mt-6" onClick={resend} disabled={busy}>{tx("إعادة إرسال رسالة التأكيد", "Resend confirmation")}</Button>}
          <Button asChild variant="link" className="mt-2 block"><Link to="/auth" search={{ mode: "login" }} onClick={() => setSentTo(null)}>{t("login")}</Link></Button>
        </div>
      </div>
    );
  }

  const title = mode === "login" ? t("login") : mode === "signup" ? t("signup") : tx("استعادة كلمة المرور", "Reset password");

  return (
    <div className="container-page grid min-h-[75vh] place-items-center py-16">
      <form onSubmit={submit} noValidate className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card-gradient p-8 shadow-card">
        <h1 className="text-2xl font-bold">{title}</h1>
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="name">{t("full_name")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" required />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={255} required />
        </div>
        {mode !== "forgot" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pw">{t("password")}</Label>
              {mode === "login" && <Link to="/auth" search={{ mode: "forgot" }} className="text-xs text-primary hover:underline">{t("forgot")}</Link>}
            </div>
            <PasswordInput id="pw" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
            {mode === "signup" && <p className="text-xs text-muted-foreground">{tx("8 أحرف على الأقل، تتضمن حروفاً وأرقاماً.", "At least 8 characters with letters and numbers.")}</p>}
          </div>
        )}
        {mode === "signup" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="pw2">{t("confirm_password")}</Label>
              <PasswordInput id="pw2" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref">{t("ref_code_opt")}</Label>
              <Input id="ref" dir="ltr" value={refCode} onChange={(e) => setRefCode(e.target.value.replace(/[^A-Za-z0-9]/g, ""))} maxLength={16} />
            </div>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
              <span>
                {tx("أوافق على ", "I accept the ")}
                <Link to="/terms" className="text-primary underline">{tx("شروط الخدمة", "Terms of Service")}</Link>
                {tx(" و", " and ")}
                <Link to="/privacy" className="text-primary underline">{tx("سياسة الخصوصية", "Privacy Policy")}</Link>
                {tx(" وقرأت ", " and have read the ")}
                <Link to="/risk-disclosure" className="text-primary underline">{tx("الإفصاح عن المخاطر", "Risk Disclosure")}</Link>
              </span>
            </label>
          </>
        )}
        {error && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          {mode === "forgot" ? tx("إرسال رابط الاستعادة", "Send reset link") : title}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>{tx("ليس لديك حساب؟ ", "No account? ")}<Link to="/auth" search={{ mode: "signup" }} className="text-primary hover:underline">{t("signup")}</Link></>
          ) : (
            <>{tx("لديك حساب؟ ", "Have an account? ")}<Link to="/auth" search={{ mode: "login" }} className="text-primary hover:underline">{t("login")}</Link></>
          )}
        </p>
      </form>
    </div>
  );
}

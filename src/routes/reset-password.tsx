import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/site/PasswordInput";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { authErrorMessage, passwordIssues } from "@/lib/auth-errors";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "إعادة تعيين كلمة المرور — Nova Invest" },
      { name: "description", content: "Set a new password for your Nova Invest account." },
      { property: "og:title", content: "Reset password — Nova Invest" },
      { property: "og:description", content: "Set a new password for your Nova Invest account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const { tx, lang } = useI18n();
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "PASSWORD_RECOVERY") setReady(true); });
    const hash = window.location.hash;
    if (hash.includes("error")) setReady(false);
    supabase.auth.getSession().then(({ data: d }) => {
      if (d.session) setReady(true);
      else if (!hash.includes("type=recovery")) setReady(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const issue = passwordIssues(pw, lang);
    if (issue) return setError(issue);
    if (pw !== pw2) return setError(tx("كلمتا المرور غير متطابقتين.", "Passwords do not match."));
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setError(authErrorMessage(error, lang));
    toast.success(tx("تم تحديث كلمة المرور", "Password updated"));
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-16">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card-gradient p-8 shadow-card">
        <h1 className="text-2xl font-bold">{tx("كلمة مرور جديدة", "New password")}</h1>
        {ready === false ? (
          <p className="text-destructive">{tx("الرابط غير صالح أو منتهي الصلاحية. اطلب رابطاً جديداً من صفحة تسجيل الدخول.", "This link is invalid or expired. Request a new one from the login page.")}</p>
        ) : ready === null ? (
          <Loader2 className="animate-spin text-primary" />
        ) : (
          <>
            <div className="space-y-2"><Label>{tx("كلمة المرور الجديدة", "New password")}</Label><PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div>
            <div className="space-y-2"><Label>{tx("تأكيد كلمة المرور", "Confirm password")}</Label><PasswordInput value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{tx("حفظ", "Save")}</Button>
          </>
        )}
      </form>
    </div>
  );
}

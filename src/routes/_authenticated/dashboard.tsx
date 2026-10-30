import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Bell, Copy, FileText, Gift, Headphones, History, Home, LayoutDashboard, Loader2, LogOut, Pickaxe, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Deposit } from "@/components/app/Deposit";
import { PasswordInput } from "@/components/site/PasswordInput";
import { Empty, Loading, Panel, StatCard, StatusBadge, Table, fmtDate } from "@/components/app/ui-bits";
import { useSiteSettings } from "@/components/site/ProfitCalculator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { formatUSD } from "@/lib/money";
import { authErrorMessage, passwordIssues } from "@/lib/auth-errors";

const TABS = ["overview", "deposit", "withdraw", "investments", "earnings", "referrals", "transactions", "notifications", "profile", "security", "support"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: z.object({ tab: z.enum(TABS).optional() }),
  head: () => ({ meta: [{ title: "لوحة التحكم — Nova Invest" }, { name: "description", content: "Your Nova Invest account dashboard." }, { property: "og:title", content: "Dashboard — Nova Invest" }, { property: "og:description", content: "Your Nova Invest account dashboard." }] }),
  component: Dashboard,
});

function useSummary() {
  return useQuery({ queryKey: ["summary"], queryFn: async () => { const { data, error } = await supabase.rpc("my_summary"); if (error) throw error; return data as Record<string, number>; } });
}
function useProfile() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["profile", user?.id], enabled: !!user, queryFn: async () => { if (!user) throw new Error("Unauthorized"); const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single(); if (error) throw error; return data; } });
}
function useNetworks() {
  return useQuery({ queryKey: ["networks"], queryFn: async () => { const { data, error } = await supabase.from("supported_networks").select("*").eq("enabled", true).eq("verified", true).order("asset"); if (error) throw error; return data; } });
}

function Dashboard() {
  const { tab = "overview" } = Route.useSearch();
  const { tx, t } = useI18n();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const items: { k: Tab; icon: typeof Home; label: string }[] = [
    { k: "overview", icon: LayoutDashboard, label: tx("لوحة التحكم", "Dashboard") },
    { k: "deposit", icon: ArrowDownToLine, label: tx("الإيداع", "Deposit") },
    { k: "withdraw", icon: ArrowUpFromLine, label: tx("السحب", "Withdraw") },
    { k: "investments", icon: Pickaxe, label: tx("استثماراتي", "My Investments") },
    { k: "earnings", icon: FileText, label: tx("الأرباح والسجلات", "Earnings & Reports") },
    { k: "referrals", icon: Gift, label: tx("الإحالات", "Referrals") },
    { k: "transactions", icon: History, label: tx("سجل المعاملات", "Transactions") },
    { k: "notifications", icon: Bell, label: tx("الإشعارات", "Notifications") },
    { k: "profile", icon: User, label: tx("الملف الشخصي", "Profile") },
    { k: "security", icon: Shield, label: tx("الأمان", "Security") },
    { k: "support", icon: Headphones, label: tx("الدعم", "Support") },
  ];
  const out = async () => { await qc.cancelQueries(); qc.clear(); await signOut(); navigate({ to: "/auth", replace: true }); };

  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-[230px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-2 lg:flex-col">
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-muted-foreground hover:bg-accent"><Home className="size-4" />{t("nav_home")}</Link>
          {items.map((i) => (
            <Link key={i.k} to="/dashboard" search={{ tab: i.k }} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap ${tab === i.k ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent"}`}>
              <i.icon className="size-4" />{i.label}
            </Link>
          ))}
          <Button variant="ghost" onClick={out} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-destructive hover:bg-destructive/10"><LogOut className="size-4" />{t("logout")}</Button>
        </nav>
      </aside>
      <div className="min-w-0 space-y-6">
        <SandboxBanner />
        {tab === "overview" && <Overview />}
        {tab === "deposit" && <Deposit />}
        {tab === "withdraw" && <Withdraw />}
        {tab === "investments" && <Investments />}
        {tab === "earnings" && <Earnings />}
        {tab === "referrals" && <Referrals />}
        {tab === "transactions" && <Transactions />}
        {tab === "notifications" && <Notifications />}
        {tab === "profile" && <Profile />}
        {tab === "security" && <Security />}
        {tab === "support" && <Support />}
      </div>
    </div>
  );
}

function SandboxBanner() {
  const { tx } = useI18n();
  const { data: s } = useSiteSettings();
  if (!s || (s.deposits_enabled && s.environment_label === "production")) return null;
  return (
    <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
      <AlertTriangle className="size-5 shrink-0 text-warning" />
      <p>{tx("المنصّة في وضع الإعداد. الإيداعات والسحوبات الحقيقية غير مفعّلة حتى تُكمل الإدارة إعداد عناوين المحافظ ومزود التحقق. لا تُرسل أي أموال الآن.", "The platform is in setup mode. Real deposits and withdrawals stay disabled until the administrator configures wallet addresses and a verification provider. Do not send funds now.")}</p>
    </div>
  );
}

function Overview() {
  const { tx, lang } = useI18n();
  const { data: s, isLoading } = useSummary();
  const { data: p } = useProfile();
  const { data: ledger } = useQuery({ queryKey: ["ledger", 5], queryFn: async () => (await supabase.from("ledger_entries").select("*").order("created_at", { ascending: false }).limit(5)).data ?? [] });
  if (isLoading) return <Loading />;
  const f = (v: unknown) => formatUSD(Number(v ?? 0), lang);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{tx("مرحباً", "Welcome")} {p?.full_name}</h1>
          <p className="text-sm text-muted-foreground">{tx("حالة التحقق", "Verification")}: <StatusBadge s={p?.verification_status ?? "unverified"} /></p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="hero"><Link to="/dashboard" search={{ tab: "deposit" }}><ArrowDownToLine />{tx("إيداع", "Deposit")}</Link></Button>
          <Button asChild variant="secondary"><Link to="/dashboard" search={{ tab: "withdraw" }}><ArrowUpFromLine />{tx("سحب", "Withdraw")}</Link></Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard tone="gold" label={tx("الرصيد المتاح", "Available balance")} value={f(s?.available)} />
        <StatCard label={tx("إجمالي الإيداعات المؤكَّدة", "Confirmed deposits")} value={f(s?.confirmed_deposits)} />
        <StatCard label={tx("إيداعات قيد الانتظار", "Pending deposits")} value={String(s?.pending_deposits ?? 0)} />
        <StatCard label={tx("سحوبات محجوزة/قيد المعالجة", "Pending withdrawals")} value={f(s?.pending_withdrawals)} />
        <StatCard label={tx("توزيعات التعدين المحققة", "Realized mining distributions")} value={f(s?.distributions)} />
        <StatCard label={tx("عمولات الإحالة المدفوعة", "Referral commissions paid")} value={f(s?.commissions_paid)} />
      </div>
      <p className="text-xs text-muted-foreground">{tx("جميع الأرقام أعلاه مستمدة من سجلات قاعدة البيانات المؤكَّدة. العوائد التقديرية تظهر فقط في الحاسبة ولا تُضاف إلى رصيدك.", "All figures above come from confirmed database records. Estimated returns appear only in the calculator and are never added to your balance.")}</p>
      <Panel title={tx("آخر المعاملات", "Recent transactions")}>
        <LedgerTable rows={ledger ?? []} />
      </Panel>
    </>
  );
}

type LedgerRow = { id: string; kind: string; amount_usd: number; ref_type: string; note: string | null; created_at: string };
function LedgerTable({ rows }: { rows: LedgerRow[] }) {
  const { tx, lang } = useI18n();
  return <Table head={[tx("النوع", "Type"), tx("المبلغ", "Amount"), tx("المرجع", "Reference"), tx("التاريخ", "Date")]} rows={rows.map((r) => [r.kind, <span key="a" dir="ltr" className={Number(r.amount_usd) < 0 ? "text-destructive" : "text-success"}>{formatUSD(r.amount_usd, lang)}</span>, r.note ?? r.ref_type, fmtDate(r.created_at)])} />;
}


function Withdraw() {
  const { tx, lang } = useI18n();
  const qc = useQueryClient();
  const { data: s } = useSiteSettings();
  const { data: sum } = useSummary();
  const { data: nets } = useNetworks();
  const [netId, setNetId] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [reqId, setReqId] = useState(() => crypto.randomUUID());
  const { data: ws } = useQuery({ queryKey: ["withdrawals"], queryFn: async () => (await supabase.from("withdrawals").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [] });
  const net = nets?.find((n) => n.id === netId);
  const fee = Number(net?.withdrawal_fee ?? 0);
  const m = useMutation({
    mutationFn: async () => { const { error } = await supabase.rpc("request_withdrawal", { _network_id: netId, _address: address.trim(), _amount: Number(amount), _client_request_id: reqId }); if (error) throw error; },
    onSuccess: () => { toast.success(tx("تم تقديم طلب السحب للمراجعة", "Withdrawal submitted for review")); setConfirming(false); setAmount(""); setAddress(""); setReqId(crypto.randomUUID()); qc.invalidateQueries(); },
    onError: (e: Error) => { toast.error(e.message); setConfirming(false); },
  });
  const available = !!s?.withdrawals_enabled && (nets?.length ?? 0) > 0;
  const amt = Number(amount);
  const valid = amt > 0 && /^\d+(\.\d{1,2})?$/.test(amount) && amt + fee <= Number(sum?.available ?? 0) && address.trim().length >= 20;
  return (
    <>
      <h1 className="text-2xl font-bold">{tx("السحب", "Withdraw")}</h1>
      <Panel title={tx("طلب سحب جديد", "New withdrawal")} action={<span className="text-sm text-muted-foreground">{tx("المتاح", "Available")}: <b dir="ltr">{formatUSD(sum?.available ?? 0, lang)}</b></span>}>
        {!available ? <Empty text={tx("السحوبات غير مفعّلة بعد. تتطلب بنية محافظ آمنة وتمويلاً تشغيلياً تُعدّه الإدارة.", "Withdrawals are not enabled yet. They require secure wallet infrastructure and operational funding configured by the administrator.")} /> : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(e: FormEvent) => { e.preventDefault(); if (valid) setConfirming(true); }}>
            <div className="space-y-2"><Label>{tx("الأصل والشبكة", "Asset & network")}</Label>
              <select value={netId} onChange={(e) => setNetId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                <option value="">{tx("اختر…", "Select…")}</option>
                {(nets ?? []).map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>{tx("المبلغ (دولار)", "Amount (USD)")}</Label><Input dir="ltr" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} /></div>
            <div className="space-y-2 md:col-span-2"><Label>{tx("عنوان المحفظة المستلمة", "Destination address")}</Label><Input dir="ltr" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={120} /></div>
            {net && <p className="text-sm text-muted-foreground md:col-span-2">{tx("الرسوم", "Fee")}: ${fee.toFixed(2)} · {tx("الحد الأدنى", "Min")}: ${Number(net.min_withdrawal).toFixed(2)} · {tx("الإجمالي المخصوم", "Total debited")}: ${(amt + fee || 0).toFixed(2)}</p>}
            {confirming ? (
              <div className="space-y-3 rounded-lg border border-primary/40 bg-primary/10 p-4 md:col-span-2">
                <p className="text-sm">{tx("تأكيد: سحب", "Confirm: withdraw")} <b dir="ltr">${amt.toFixed(2)}</b> {tx("إلى", "to")} <span dir="ltr" className="font-mono break-all">{address}</span> ({net?.label})</p>
                <div className="flex gap-2"><Button type="button" variant="hero" disabled={m.isPending} onClick={() => m.mutate()}>{m.isPending && <Loader2 className="animate-spin" />}{tx("تأكيد نهائي", "Final confirm")}</Button><Button type="button" variant="secondary" onClick={() => setConfirming(false)}>{tx("إلغاء", "Cancel")}</Button></div>
              </div>
            ) : <Button type="submit" variant="hero" disabled={!valid || !netId} className="md:col-span-2">{tx("متابعة", "Continue")}</Button>}
          </form>
        )}
      </Panel>
      <Panel title={tx("سجل السحوبات", "Withdrawal history")}>
        <Table head={[tx("المبلغ", "Amount"), tx("الرسوم", "Fee"), tx("الشبكة", "Network"), tx("الحالة", "Status"), "TX", tx("التاريخ", "Date")]} rows={(ws ?? []).map((w) => [`$${w.amount_usd}`, `$${w.fee_usd}`, `${w.asset} · ${w.network}`, <StatusBadge key="s" s={w.status} />, <span key="t" className="font-mono text-xs">{w.tx_hash ?? "—"}</span>, fmtDate(w.created_at)])} />
      </Panel>
    </>
  );
}

function Investments() {
  const { tx } = useI18n();
  return (
    <>
      <h1 className="text-2xl font-bold">{tx("استثماراتي", "My Investments")}</h1>
      <Panel title={tx("عقود الاستثمار", "Investment contracts")}>
        <Empty text={tx("لا توجد عقود استثمار مفعّلة. سيتم تفعيل العقود فقط بعد اعتماد نموذج العمل والشروط القانونية. رصيدك المؤكَّد يظهر في لوحة التحكم.", "No investment contracts are active. Contracts will be enabled only after the business model and legal terms are approved. Your confirmed balance appears on the dashboard.")} />
      </Panel>
    </>
  );
}

function Earnings() {
  const { tx, lang } = useI18n();
  const { data: dist } = useQuery({ queryKey: ["distributions"], queryFn: async () => (await supabase.from("revenue_distributions").select("*").order("created_at", { ascending: false })).data ?? [] });
  const { data: reports } = useQuery({ queryKey: ["reports-public"], queryFn: async () => (await supabase.from("mining_reports").select("*").eq("published", true).order("period_end", { ascending: false })).data ?? [] });
  return (
    <>
      <h1 className="text-2xl font-bold">{tx("الأرباح والسجلات", "Earnings & Reports")}</h1>
      <Panel title={tx("توزيعات محققة", "Realized distributions")}>
        <Table head={[tx("المبلغ", "Amount"), tx("الحالة", "Status"), tx("التاريخ", "Date")]} rows={(dist ?? []).map((d) => [formatUSD(d.amount_usd, lang), <StatusBadge key="s" s={d.status} />, fmtDate(d.created_at)])} />
      </Panel>
      <Panel title={tx("تقارير التعدين المنشورة", "Published mining reports")}>
        {(reports ?? []).length === 0 ? <Empty text={tx("لم تُنشر أي تقارير تعدين مُتحقَّق منها بعد.", "No verified mining reports have been published yet.")} /> :
          <Table head={[tx("الفترة", "Period"), "BTC", tx("رسوم المجمّع", "Pool fees"), tx("المجمّع", "Pool")]} rows={(reports ?? []).map((r) => [`${r.period_start} → ${r.period_end}`, r.btc_mined, r.pool_fees_btc, r.pool_name ?? "—"])} />}
      </Panel>
    </>
  );
}

function Referrals() {
  const { tx, lang } = useI18n();
  const { data: p } = useProfile();
  const { data: st } = useQuery({ queryKey: ["refstats"], queryFn: async () => (await supabase.rpc("my_referral_stats")).data as Record<string, number> | null });
  const { data: com } = useQuery({ queryKey: ["commissions"], queryFn: async () => (await supabase.from("referral_commissions").select("*").order("created_at", { ascending: false })).data ?? [] });
  const url = p ? `${typeof window !== "undefined" ? window.location.origin : ""}/auth?mode=signup&ref=${p.referral_code}` : "";
  const f = (v: unknown) => formatUSD(Number(v ?? 0), lang);
  return (
    <>
      <h1 className="text-2xl font-bold">{tx("برنامج الإحالة", "Referral Program")}</h1>
      <Panel title={tx("رابط الإحالة", "Your referral link")} action={<Link to="/referral-terms" className="text-sm text-primary hover:underline">{tx("الشروط", "Terms")}</Link>}>
        <div className="flex gap-2"><Input readOnly dir="ltr" value={url} /><Button variant="hero" onClick={() => { navigator.clipboard.writeText(url); toast.success(tx("تم النسخ", "Copied")); }}><Copy />{tx("نسخ", "Copy")}</Button></div>
        <p className="mt-2 text-sm text-muted-foreground">{tx("رمزك", "Your code")}: <b className="font-mono">{p?.referral_code}</b></p>
      </Panel>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={tx("التسجيلات", "Registrations")} value={String(st?.registrations ?? 0)} />
        <StatCard label={tx("إحالات مؤهلة", "Eligible referrals")} value={String(st?.eligible ?? 0)} />
        <StatCard label={tx("حجم مؤهل", "Eligible volume")} value={f(st?.volume)} />
        <StatCard label={tx("معلّقة", "Pending")} value={f(st?.pending)} />
        <StatCard label={tx("معتمدة", "Approved")} value={f(st?.approved)} />
        <StatCard tone="gold" label={tx("مدفوعة", "Paid")} value={f(st?.paid)} />
      </div>
      <Panel title={tx("سجل العمولات", "Commission history")}>
        <Table head={[tx("الأساس", "Basis"), tx("النسبة", "Rate"), tx("العمولة", "Commission"), tx("الحالة", "Status"), tx("التاريخ", "Date")]} rows={(com ?? []).map((c) => [f(c.basis_usd), `${(Number(c.rate) * 100).toFixed(2)}%`, f(c.amount_usd), <StatusBadge key="s" s={c.status} />, fmtDate(c.created_at)])} />
      </Panel>
    </>
  );
}

function Transactions() {
  const { tx } = useI18n();
  const { data, isLoading } = useQuery({ queryKey: ["ledger", "all"], queryFn: async () => (await supabase.from("ledger_entries").select("*").order("created_at", { ascending: false }).limit(200)).data ?? [] });
  return <><h1 className="text-2xl font-bold">{tx("سجل المعاملات", "Transaction history")}</h1><Panel title={tx("دفتر الحساب", "Ledger")}>{isLoading ? <Loading /> : <LedgerTable rows={data ?? []} />}</Panel></>;
}

function Notifications() {
  const { tx } = useI18n();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100)).data ?? [] });
  const markAll = async () => { await supabase.from("notifications").update({ read: true }).eq("read", false); qc.invalidateQueries({ queryKey: ["notifications"] }); };
  return (
    <><h1 className="text-2xl font-bold">{tx("الإشعارات", "Notifications")}</h1>
      <Panel title={tx("كل الإشعارات", "All notifications")} action={<Button size="sm" variant="secondary" onClick={markAll}>{tx("تعليم الكل كمقروء", "Mark all read")}</Button>}>
        {(data ?? []).length === 0 ? <Empty /> : <ul className="divide-y divide-border">{(data ?? []).map((n) => <li key={n.id} className={`py-3 ${n.read ? "opacity-60" : ""}`}><p className="font-medium">{n.title}</p><p className="text-sm text-muted-foreground">{n.body} · {fmtDate(n.created_at)}</p></li>)}</ul>}
      </Panel></>
  );
}

function Profile() {
  const { tx } = useI18n();
  const { data: p } = useProfile();
  const qc = useQueryClient();
  const [name, setName] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: async () => { if (!p) throw new Error("Unauthorized"); const v = (name ?? "").trim(); if (v.length < 2 || v.length > 100) throw new Error(tx("الاسم غير صالح", "Invalid name")); const { error } = await supabase.from("profiles").update({ full_name: v }).eq("id", p.id); if (error) throw error; },
    onSuccess: () => { toast.success(tx("تم الحفظ", "Saved")); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  if (!p) return <Loading />;
  return (
    <><h1 className="text-2xl font-bold">{tx("الملف الشخصي", "Profile")}</h1>
      <Panel title={tx("بيانات الحساب", "Account details")}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>{tx("الاسم الكامل", "Full name")}</Label><Input value={name ?? p.full_name} onChange={(e) => setName(e.target.value)} maxLength={100} /></div>
          <div className="space-y-2"><Label>{tx("البريد", "Email")}</Label><Input value={p.email ?? ""} disabled dir="ltr" /></div>
          <p className="text-sm">{tx("حالة الحساب", "Account status")}: <StatusBadge s={p.account_status} /></p>
          <p className="text-sm">{tx("التحقق", "Verification")}: <StatusBadge s={p.verification_status} /></p>
        </div>
        <Button className="mt-4" variant="hero" disabled={save.isPending || name === null} onClick={() => save.mutate()}>{tx("حفظ", "Save")}</Button>
      </Panel></>
  );
}

function Security() {
  const { tx, lang } = useI18n();
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const issue = passwordIssues(pw, lang);
    if (issue) return toast.error(issue);
    if (pw !== pw2) return toast.error(tx("كلمتا المرور غير متطابقتين", "Passwords do not match"));
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw, current_password: cur } as { password: string });
    setBusy(false);
    if (error) toast.error(authErrorMessage(error, lang)); else { toast.success(tx("تم تغيير كلمة المرور", "Password changed")); setCur(""); setPw(""); setPw2(""); }
  };
  return (
    <><h1 className="text-2xl font-bold">{tx("الأمان", "Security")}</h1>
      <Panel title={tx("تغيير كلمة المرور", "Change password")}>
        <form onSubmit={submit} className="grid max-w-md gap-4">
          <div className="space-y-2"><Label>{tx("كلمة المرور الحالية", "Current password")}</Label><PasswordInput value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" /></div>
          <div className="space-y-2"><Label>{tx("كلمة المرور الجديدة", "New password")}</Label><PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div>
          <div className="space-y-2"><Label>{tx("تأكيد", "Confirm")}</Label><PasswordInput value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></div>
          <Button type="submit" variant="hero" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{tx("تحديث", "Update")}</Button>
        </form>
      </Panel></>
  );
}

function Support() {
  const { tx } = useI18n();
  return (
    <><h1 className="text-2xl font-bold">{tx("الدعم", "Support")}</h1>
      <Panel title={tx("التواصل مع الدعم", "Contact support")}>
        <p className="text-sm leading-loose text-muted-foreground">{tx("لم يتم إعداد قناة دعم رسمية بعد. عند إعدادها ستظهر هنا. لا تشارك أبداً كلمة المرور أو العبارة السرية لمحفظتك مع أي شخص.", "An official support channel has not been configured yet; it will appear here once set up. Never share your password or wallet seed phrase with anyone.")}</p>
        <Button asChild variant="secondary" className="mt-4"><Link to="/faq">{tx("الأسئلة الشائعة", "FAQ")}</Link></Button>
      </Panel></>
  );
}

TypeScript
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Empty, Loading, Panel, StatCard, StatusBadge, Table, fmtDate } from "@/components/app/ui-bits";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { depositErrorMessage, transactionExplorer, validateNetworkPatch } from "@/lib/deposits";
import { useI18n } from "@/lib/i18n";

const TABS = ["overview", "users", "deposits", "withdrawals", "commissions", "networks", "payments", "settings", "mining", "audit"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/_authenticated/admin")({
  validateSearch: z.object({ tab: z.enum(TABS).optional() }),
  head: () => ({ meta: [{ title: "الإدارة — Nova Invest" }, { name: "description", content: "Nova Invest administration console." }, { property: "og:title", content: "Admin — Nova Invest" }, { property: "og:description", content: "Nova Invest administration console." }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const rpcErr = (e: Error) => toast.error(e.message);

function Admin() {
  const { isAdmin, user } = useAuth();
  const { tx } = useI18n();
  const { tab = "overview" } = Route.useSearch();
  const { data: check, isLoading } = useQuery({ queryKey: ["is-admin", user?.id], enabled: !!user, queryFn: async () => { if (!user) return false; const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }); if (error) throw error; return data; } });
  if (isLoading) return <Loading />;
  if (!check && !isAdmin) return (
    <div className="container-page grid min-h-[60vh] place-items-center text-center"><div><ShieldAlert className="mx-auto size-12 text-destructive" /><h1 className="mt-4 text-2xl font-bold">{tx("غير مصرّح", "Not authorized")}</h1><p className="mt-2 text-muted-foreground">{tx("هذه الصفحة للمسؤولين فقط.", "This page is for administrators only.")}</p></div></div>
  );
  const labels: Record<Tab, string> = { overview: tx("نظرة عامة", "Overview"), users: tx("المستخدمون", "Users"), deposits: tx("الإيداعات", "Deposits"), withdrawals: tx("السحوبات", "Withdrawals"), commissions: tx("العمولات", "Commissions"), networks: tx("الأصول والشبكات", "Assets & networks"), payments: tx("فحص الاتصال", "Connection checks"), settings: tx("الإعدادات", "Settings"), mining: tx("التعدين", "Mining"), audit: tx("سجل التدقيق", "Audit log") };
  return (
    <div className="container-page space-y-6 py-8">
      <h1 className="text-2xl font-bold">{tx("لوحة الإدارة", "Admin console")}</h1>
      <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-2">
        {TABS.map((k) => <Link key={k} to="/admin" search={{ tab: k }} className={`rounded-lg px-3 py-2 text-sm whitespace-nowrap ${tab === k ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent"}`}>{labels[k]}</Link>)}
      </nav>
      {tab === "overview" && <Overview />}
      {tab === "users" && <Users />}
      {tab === "deposits" && <Deposits />}
      {tab === "withdrawals" && <Withdrawals />}
      {tab === "commissions" && <Commissions />}
      {tab === "networks" && <Networks />}
      {tab === "payments" && <PaymentChecks />}
      {tab === "settings" && <Settings />}
      {tab === "mining" && <Mining />}
      {tab === "audit" && <Audit />}
    </div>
  );
}

function Overview() {
  const { tx } = useI18n();
  const { data } = useQuery({ queryKey: ["admin-overview"], queryFn: async () => {
    const [u, d, w, c] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("deposits").select("status,usd_value"),
      supabase.from("withdrawals").select("status,amount_usd"),
      supabase.from("referral_commissions").select("status,amount_usd"),
    ]);
    return { users: u.count ?? 0, d: d.data ?? [], w: w.data ?? [], c: c.data ?? [] };
  } });
  if (!data) return <Loading />;
  const sum = (rows: { status: string }[], key: string, st: string[]) => rows.filter((r) => st.includes(r.status)).reduce((a, r) => a + Number((r as Record<string, unknown>)[key] ?? 0), 0).toFixed(2);
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label={tx("المستخدمون", "Users")} value={String(data.users)} />
      <StatCard label={tx("إيداعات بانتظار المراجعة", "Deposits awaiting review")} value={String(data.d.filter((x) => !["confirmed", "rejected", "expired"].includes(x.status)).length)} />
      <StatCard tone="gold" label={tx("إيداعات مؤكَّدة $", "Confirmed deposits $")} value={sum(data.d, "usd_value", ["confirmed"])} />
      <StatCard label={tx("سحوبات معلّقة", "Pending withdrawals")} value={String(data.w.filter((x) => ["requested", "approved"].includes(x.status)).length)} />
      <StatCard label={tx("سحوبات مكتملة $", "Completed withdrawals $")} value={sum(data.w, "amount_usd", ["completed"])} />
      <StatCard label={tx("عمولات معلّقة $", "Pending commissions $")} value={sum(data.c, "amount_usd", ["pending", "approved"])} />
    </div>
  );
}

function Users() {
  const { tx } = useI18n();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data } = useQuery({ queryKey: ["admin-users"], queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500)).data ?? [] });
  const set = useMutation({ mutationFn: async (a: { id: string; account: string; verification: string }) => { const { error } = await supabase.rpc("admin_set_account_status", { _user_id: a.id, _account: a.account, _verification: a.verification }); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }), onError: rpcErr });
  const rows = (data ?? []).filter((u) => !q || `${u.email} ${u.full_name} ${u.referral_code}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Panel title={tx("المستخدمون", "Users")} action={<Input placeholder={tx("بحث…", "Search…")} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />}>
      <Table head={[tx("الاسم", "Name"), tx("البريد", "Email"), tx("الرمز", "Code"), tx("الحساب", "Account"), tx("التحقق", "Verification"), tx("التاريخ", "Joined")]} rows={rows.map((u) => [
        u.full_name, u.email, <span key="c" className="font-mono">{u.referral_code}</span>,
        <select key="a" value={u.account_status} onChange={(e) => set.mutate({ id: u.id, account: e.target.value, verification: u.verification_status })} className="rounded border border-input bg-background px-2 py-1 text-xs">{["active", "suspended"].map((x) => <option key={x}>{x}</option>)}</select>,
        <select key="v" value={u.verification_status} onChange={(e) => set.mutate({ id: u.id, account: u.account_status, verification: e.target.value })} className="rounded border border-input bg-background px-2 py-1 text-xs">{["unverified", "pending", "verified", "rejected"].map((x) => <option key={x}>{x}</option>)}</select>,
        fmtDate(u.created_at)])} />
    </Panel>
  );
}

function Deposits() {
  const { tx } = useI18n();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-deposits"], queryFn: async () => (await supabase.from("deposits").select("*").order("created_at", { ascending: false }).limit(300)).data ?? [] });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [network, setNetwork] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const profiles = useQuery({ queryKey: ["admin-deposit-names"], queryFn: async () => { const { data, error } = await supabase.from("profiles").select("id,full_name"); if (error) throw error; return data; } });
  const name = (id: string) => profiles.data?.find(p => p.id === id)?.full_name || id.slice(0, 8);
  const filtered = (data ?? []).filter(d => (!query || `${d.reference} ${d.tx_hash ?? ""} ${name(d.user_id)}`.toLowerCase().includes(query.toLowerCase())) && (!status || d.status === status) && (!network || `${d.asset} · ${d.network}` === network) && (!from || d.created_at.slice(0,10) >= from) && (!to || d.created_at.slice(0,10) <= to));
  const [form, setForm] = useState<Record<string, { tx: string; recv: string; usd: string; reason: string }>>({});
  const f = (id: string) => form[id] ?? { tx: "", recv: "", usd: "", reason: "" };
  const upd = (id: string, k: string, v: string) => setForm({ ...form, [id]: { ...f(id), [k]: v } });
  const confirm = useMutation({ mutationFn: async (id: string) => { const x = f(id); const { error } = await supabase.rpc("admin_confirm_deposit", { _deposit_id: id, _tx_hash: x.tx, _received: Number(x.recv), _usd_value: Number(x.usd) }); if (error) throw error; }, onSuccess: () => { toast.success("OK"); qc.invalidateQueries(); }, onError: rpcErr });
  const reject = useMutation({ mutationFn: async (id: string) => { const r = f(id).reason.trim(); if (!r) throw new Error(tx("أدخل سبب الرفض", "Enter a rejection reason")); const { error } = await supabase.rpc("admin_reject_deposit", { _deposit_id: id, _reason: r }); if (error) throw error; }, onSuccess: () => qc.invalidateQueries(), onError: rpcErr });
  return (
    <Panel title={tx("طلبات الإيداع", "Deposit requests")}>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div><Label htmlFor="deposit-search">{tx("بحث", "Search")}</Label><Input id="deposit-search" value={query} onChange={e => setQuery(e.target.value)} /></div>
        <div><Label htmlFor="deposit-status">{tx("الحالة", "Status")}</Label><select id="deposit-status" className="h-10 w-full rounded-md border border-input bg-background px-2" value={status} onChange={e => setStatus(e.target.value)}><option value="">{tx("الكل", "All")}</option>{["created", "awaiting_payment", "detected", "confirming", "confirmed", "rejected", "expired"].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
        <div><Label htmlFor="deposit-filter-network">{tx("الشبكة", "Network")}</Label><select id="deposit-filter-network" className="h-10 w-full rounded-md border border-input bg-background px-2" value={network} onChange={e => setNetwork(e.target.value)}><option value="">{tx("الكل", "All")}</option>{Array.from(new Set((data ?? []).map(d => `${d.asset} · ${d.network}`))).map(v => <option key={v}>{v}</option>)}</select></div>
        <div><Label htmlFor="deposit-from">{tx("من تاريخ", "From date")}</Label><Input id="deposit-from" type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
        <div><Label htmlFor="deposit-to">{tx("إلى تاريخ", "To date")}</Label><Input id="deposit-to" type="date" min={from} value={to} onChange={e => setTo(e.target.value)} /></div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{tx("أكّد الإيداع فقط بعد التحقق على مستكشف الشبكة من: الأصل، الشبكة، العنوان المستلم، المبلغ، عدد التأكيدات. معرّف المعاملة فريد ولا يمكن استخدامه مرتين.", "Confirm only after verifying on a block explorer: asset, network, destination, amount, confirmations. A transaction hash is unique and cannot be credited twice.")}</p>
      {filtered.length === 0 ? <Empty /> : (
        <div className="space-y-3">{filtered.map((d) => (
          <div key={d.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm"><span>{name(d.user_id)}</span><span className="font-mono">{d.reference}</span><span>{d.expected_amount} {d.asset} · {d.network}</span><StatusBadge s={d.status} /><span className="text-muted-foreground">{fmtDate(d.created_at)}</span>{d.tx_hash && <span dir="ltr" className="max-w-full break-all font-mono text-xs">{d.tx_hash}</span>}</div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground"><span>{tx("المستلم", "Received")}: {d.received_amount ?? "—"}</span><span>USD: {d.usd_value ?? "—"}</span><span>{tx("التأكيدات", "Confirmations")}: {d.confirmations}</span><span>{tx("تاريخ التأكيد", "Confirmed at")}: {fmtDate(d.confirmed_at)}</span>{transactionExplorer(d, d.tx_hash) && <a href={transactionExplorer(d, d.tx_hash) ?? undefined} target="_blank" rel="noopener noreferrer" className="text-primary underline">{tx("مستكشف المعاملة", "Transaction explorer")}</a>}</div>
            {!["confirmed", "rejected", "expired"].includes(d.status) && (
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <Input dir="ltr" placeholder="TX hash" value={f(d.id).tx} onChange={(e) => upd(d.id, "tx", e.target.value)} />
                <Input dir="ltr" placeholder={tx("المستلم فعلياً", "Received amount")} value={f(d.id).recv} onChange={(e) => upd(d.id, "recv", e.target.value)} />
                <Input dir="ltr" placeholder={tx("القيمة $", "USD value")} value={f(d.id).usd} onChange={(e) => upd(d.id, "usd", e.target.value)} />
                <Button variant="hero" disabled={confirm.isPending} onClick={() => confirm.mutate(d.id)}>{tx("تأكيد", "Confirm")}</Button>
                <div className="flex gap-1"><Input placeholder={tx("سبب الرفض", "Reason")} value={f(d.id).reason} onChange={(e) => upd(d.id, "reason", e.target.value)} /><Button variant="destructive" onClick={() => reject.mutate(d.id)}>{tx("رفض", "Reject")}</Button></div>
              </div>
            )}
          </div>
        ))}</div>
      )}
    </Panel>
  );
}

function Withdrawals() {
  const { tx } = useI18n();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-withdrawals"], queryFn: async () => (await supabase.from("withdrawals").select("*").order("created_at", { ascending: false }).limit(300)).data ?? [] });
  const [inp, setInp] = useState<Record<string, { tx: string; reason: string }>>({});
  const g = (id: string) => inp[id] ?? { tx: "", reason: "" };
  const act = useMutation({ mutationFn: async (a: { id: string; status: "approved" | "broadcast" | "completed" | "rejected" }) => { const x = g(a.id); if (a.status === "rejected" && !x.reason.trim()) throw new Error(tx("أدخل السبب", "Enter reason")); const { error } = await supabase.rpc("admin_update_withdrawal", { _id: a.id, _status: a.status, _tx_hash: x.tx, _reason: x.reason }); if (error) throw error; }, onSuccess: () => qc.invalidateQueries(), onError: rpcErr });
  return (
    <Panel title={tx("طلبات السحب", "Withdrawal requests")}>
      {(data ?? []).length === 0 ? <Empty /> : <div className="space-y-3">{(data ?? []).map((w) => (
        <div key={w.id} className="rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm"><b>${w.amount_usd}</b><span>+ ${w.fee_usd} fee</span><span>{w.asset} · {w.network}</span><span dir="ltr" className="font-mono text-xs break-all">{w.destination_address}</span><StatusBadge s={w.status} /><span className="text-muted-foreground">{fmtDate(w.created_at)}</span></div>
          {!["completed", "rejected", "cancelled"].includes(w.status) && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Input dir="ltr" placeholder="TX hash" className="max-w-xs" value={g(w.id).tx} onChange={(e) => setInp({ ...inp, [w.id]: { ...g(w.id), tx: e.target.value } })} />
              <Input placeholder={tx("سبب الرفض", "Reason")} className="max-w-xs" value={g(w.id).reason} onChange={(e) => setInp({ ...inp, [w.id]: { ...g(w.id), reason: e.target.value } })} />
              {w.status === "requested" && <Button variant="hero" onClick={() => act.mutate({ id: w.id, status: "approved" })}>{tx("اعتماد", "Approve")}</Button>}
              {w.status === "approved" && <Button variant="hero" onClick={() => act.mutate({ id: w.id, status: "broadcast" })}>{tx("تم البث", "Mark broadcast")}</Button>}
              {w.status === "broadcast" && <Button variant="hero" onClick={() => act.mutate({ id: w.id, status: "completed" })}>{tx("مكتمل (مُتحقَّق)", "Completed (verified)")}</Button>}
              {w.status !== "broadcast" && <Button variant="destructive" onClick={() => act.mutate({ id: w.id, status: "rejected" })}>{tx("رفض وإعادة الأموال", "Reject & release")}</Button>}
            </div>
          )}
        </div>
      ))}</div>}
    </Panel>
  );
}

function Commissions() {
  const { tx } = useI18n();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-commissions"], queryFn: async () => (await supabase.from("referral_commissions").select("*").order("created_at", { ascending: false })).data ?? [] });
  const act = useMutation({ mutationFn: async (a: { id: string; s: "approved" | "paid" | "reversed" }) => { const { error } = await supabase.rpc("admin_set_commission_status", { _id: a.id, _status: a.s }); if (error) throw error; }, onSuccess: () => qc.invalidateQueries(), onError: rpcErr });
  return (
    <Panel title={tx("عمولات الإحالة", "Referral commissions")}>
      <Table head={[tx("الأساس", "Basis"), tx("النسبة", "Rate"), tx("العمولة", "Amount"), tx("الحالة", "Status"), tx("التاريخ", "Date"), ""]} rows={(data ?? []).map((c) => [`$${c.basis_usd}`, `${(Number(c.rate) * 100).toFixed(2)}%`, `$${c.amount_usd}`, <StatusBadge key="s" s={c.status} />, fmtDate(c.created_at),
        <div key="a" className="flex gap-1">{c.status === "pending" && <Button size="sm" variant="hero" onClick={() => act.mutate({ id: c.id, s: "approved" })}>{tx("اعتماد", "Approve")}</Button>}{c.status === "approved" && <Button size="sm" variant="hero" onClick={() => act.mutate({ id: c.id, s: "paid" })}>{tx("دفع", "Pay")}</Button>}{["pending", "approved"].includes(c.status) && <Button size="sm" variant="destructive" onClick={() => act.mutate({ id: c.id, s: "reversed" })}>{tx("إلغاء", "Reverse")}</Button>}</div>])} />
    </Panel>
  );
}

function Networks() {
  const { tx } = useI18n();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-networks"], queryFn: async () => (await supabase.from("supported_networks").select("*").order("asset")).data ?? [] });
  const [edit, setEdit] = useState<Record<string, Record<string, string | boolean>>>({});
  const save = useMutation({ mutationFn: async (id: string) => { let patch; try { patch = validateNetworkPatch(edit[id] ?? {}); } catch { throw new Error(tx("إعدادات غير صالحة: التأكيدات عدد صحيح موجب والمبالغ غير سالبة.", "Invalid settings: confirmations must be a positive integer and amounts non-negative.")); } const { error } = await supabase.rpc("admin_update_network", { _id: id, _patch: patch }); if (error) throw error; }, onSuccess: () => { toast.success(tx("تم الحفظ", "Saved")); qc.invalidateQueries({ queryKey: ["admin-networks"] }); qc.invalidateQueries({ queryKey: ["deposit-networks"] }); qc.invalidateQueries({ queryKey: ["networks"] }); }, onError: rpcErr });
  return (
    <Panel title={tx("الأصول والشبكات وعناوين الاستلام", "Assets, networks & receiving addresses")}>
      <p className="mb-4 text-sm text-muted-foreground">{tx("لن تظهر الشبكة للمستخدمين إلا إذا كانت مفعّلة ومُتحقَّقاً منها ولها عنوان استلام. تحقق من العنوان بإرسال مبلغ اختباري صغير قبل التفعيل.", "A network appears to users only when enabled, verified, and given a receiving address. Verify the address with a small test transfer before enabling.")}</p>
      <div className="space-y-4">{(data ?? []).map((n) => { const e = edit[n.id] ?? {}; const v = (k: keyof typeof n) => String(e[k as string] ?? n[k] ?? ""); const s = (k: string, val: string | boolean) => setEdit({ ...edit, [n.id]: { ...e, [k]: val } }); return (
        <div key={n.id} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-6">
          <p className="font-semibold md:col-span-6">{n.label}</p>
  
          <div className="space-y-1 md:col-span-3"><Label className="text-xs">{tx("عنوان الاستلام", "Receiving address")}</Label><Input dir="ltr" value={v("deposit_address")} onChange={(x) => s("deposit_address", x.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">{tx("التأكيدات", "Confirmations")}</Label><Input dir="ltr" value={v("required_confirmations")} onChange={(x) => s("required_confirmations", x.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">{tx("أدنى إيداع", "Min deposit")}</Label><Input dir="ltr" value={v("min_deposit")} onChange={(x) => s("min_deposit", x.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">{tx("أدنى سحب $", "Min withdrawal $")}</Label><Input dir="ltr" value={v("min_withdrawal")} onChange={(x) => s("min_withdrawal", x.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">{tx("رسوم السحب $", "Withdrawal fee $")}</Label><Input dir="ltr" value={v("withdrawal_fee")} onChange={(x) => s("withdrawal_fee", x.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm"><Switch checked={(e.verified as boolean) ?? n.verified} onCheckedChange={(c) => s("verified", c)} />{tx("مُتحقَّق", "Verified")}</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={(e.enabled as boolean) ?? n.enabled} onCheckedChange={(c) => s("enabled", c)} />{tx("مفعّل", "Enabled")}</label>
          <Button variant="hero" onClick={() => save.mutate(n.id)} disabled={!edit[n.id] || save.isPending}>{tx("حفظ", "Save")}</Button>
        </div>); })}</div>
    </Panel>
  );
}

function PaymentChecks() {
  const { tx } = useI18n();
  const [result, setResult] = useState<{
    mode?: string;
    database_changed?: boolean;
    deposits_enabled?: boolean;
    withdrawals_enabled?: boolean;
    checks?: Record<string, { ok?: boolean; tip_height?: number | null; error?: string; http_status?: number }>;
    message?: string;
    error?: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const runCheck = async () => {
    setBusy(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("payment-connectivity-check", { body: {} });
      if (error) throw error;
      if (data?.mode !== "read_only_connectivity_check") {
        throw new Error(data?.error || "Unexpected response");
      }
      setResult(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setResult({ error: message });
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const Status = ({ name, item }: { name: string; item?: { ok?: boolean; tip_height?: number | null; error?: string; http_status?: number } }) => (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">{name}</span>
        <StatusBadge s={item?.ok ? "connected" : "error"} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {item?.ok
          ? `${tx("ارتفاع آخر كتلة", "Latest block height")}: ${item.tip_height ?? "—"}`
          : item?.error || tx("لم ينجح الاتصال", "Connection failed")}
      </p>
      {item?.http_status != null && <p className="mt-1 text-xs text-muted-foreground">HTTP {item.http_status}</p>}
    </div>
  );

  return (
    <Panel title={tx("فحص اتصال شبكات الدفع", "Payment network connectivity")}>
      <p className="mb-4 text-sm text-muted-foreground">
        {tx(
          "هذا الفحص يختبر الوصول إلى واجهات Bitcoin وTRON فقط. لا ينشئ معاملات ولا يؤكد إيداعات ولا يغيّر قاعدة البيانات.",
          "This checks access to Bitcoin and TRON APIs only. It does not create transactions, confirm deposits, or change the database."
        )}
      </p>
      <Button variant="hero" onClick={runCheck} disabled={busy}>
        {busy ? tx("جارٍ الفحص…", "Checking…") : tx("فحص الاتصال الآن", "Check connectivity now")}
      </Button>
      {result && (
        <div className="mt-4 space-y-3">
          {result.error ? (
            <p className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive">{result.error}</p>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <Status name="Bitcoin" item={result.checks?.bitcoin} />
                <Status name="TRON (USDT TRC20)" item={result.checks?.tron} />
              </div>
              <p className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                {tx("وضع الفحص للقراءة فقط", "Read-only check mode")} ·
                {tx("قاعدة البيانات لم تتغير", "Database unchanged")} ·
                {tx("الإيداعات والسحوبات لا تزال معطّلة", "Deposits and withdrawals remain disabled")}
              </p>
            </>
          )}
        </div>
      )}
    </Panel>
  );
}

function Settings() {
  const { tx } = useI18n();
  const qc = useQueryClient();
  const { data: s } = useQuery({ queryKey: ["site_settings"], queryFn: async () => (await supabase.from("site_settings").select("*").eq("id", 1).single()).data });
  const [p, setP] = useState<Record<string, string | boolean>>({});
  const save = useMutation({
    mutationFn: async () => {
      const patch = { ...p };
      for (const k of ["calculator_monthly_rate", "referral_rate"]) {
        if (k in patch) {
          const n = Number(patch[k]) / 100;
          if (!(n >= 0 && n <= 0.1)) throw new Error(tx("نسبة غير صالحة", "Invalid rate"));
          patch[k] = String(n);
        }
      }
      const { error } = await supabase.rpc("admin_update_settings", { _patch: patch }); if (error) throw error;
    },
    onSuccess: () => { toast.success("OK"); setP({}); qc.invalidateQueries({ queryKey: ["site_settings"] }); }, onError: rpcErr,
  });
  if (!s) return <Loading />;
  const val = (k: keyof typeof s, pct = false) => String(p[k as string] ?? (pct ? +(Number(s[k]) * 100).toFixed(4) : s[k] ?? ""));
  const sw = (k: "deposits_enabled" | "withdrawals_enabled") => (p[k] as boolean | undefined) ?? s[k];
  return (
    <Panel title={tx("إعدادات المنصّة", "Platform settings")}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1"><Label>{tx("المعدل الشهري التوضيحي للحاسبة (%)", "Calculator illustrative monthly rate (%)")}</Label><Input dir="ltr" value={val("calculator_monthly_rate", true)} onChange={(e) => setP({ ...p, calculator_monthly_rate: e.target.value })} /></div>
        <div className="space-y-1"><Label>{tx("نسبة عمولة الإحالة (%)", "Referral commission rate (%)")}</Label><Input dir="ltr" value={val("referral_rate", true)} onChange={(e) => setP({ ...p, referral_rate: e.target.value })} /></div>
        <div className="space-y-1"><Label>{tx("الحد الأدنى للاستثمار $", "Minimum investment $")}</Label><Input dir="ltr" value={val("min_investment_usd")} onChange={(e) => setP({ ...p, min_investment_usd: e.target.value })} /></div>
        <div className="space-y-1"><Label>{tx("مزود الدفع", "Payment provider")}</Label><Input dir="ltr" value={val("payment_provider")} onChange={(e) => setP({ ...p, payment_provider: e.target.value })} /></div>
        <div className="space-y-1"><Label>{tx("الولايات القضائية المدعومة", "Supported jurisdictions")}</Label><Input value={val("supported_jurisdictions")} onChange={(e) => setP({ ...p, supported_jurisdictions: e.target.value })} /></div>
        <div className="space-y-1"><Label>{tx("البيئة (setup / test / production)", "Environment (setup / test / production)")}</Label><Input dir="ltr" value={val("environment_label")} onChange={(e) => setP({ ...p, environment_label: e.target.value })} /></div>
        <label className="flex items-center gap-2"><Switch checked={sw("deposits_enabled")} onCheckedChange={(c) => setP({ ...p, deposits_enabled: c })} />{tx("تفعيل الإيداعات", "Enable deposits")}</label>
        <label className="flex items-center gap-2"><Switch checked={sw("withdrawals_enabled")} onCheckedChange={(c) => setP({ ...p, withdrawals_enabled: c })} />{tx("تفعيل السحوبات", "Enable withdrawals")}</label>
      </div>
      <p className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">{tx("لا تفعّل الإيداعات الحقيقية قبل استكمال المتطلبات القانونية والتشغيلية وإعداد مزود تحقق موثوق.", "Do not enable real deposits before legal, operational, and verification-provider requirements are complete.")}</p>
      <Button className="mt-4" variant="hero" disabled={!Object.keys(p).length || save.isPending} onClick={() => save.mutate()}>{tx("حفظ", "Save")}</Button>
    </Panel>
  );
}

function Mining() {
  const { tx } = useI18n();
  const qc = useQueryClient();
  const { data: eq } = useQuery({ queryKey: ["admin-equipment"], queryFn: async () => (await supabase.from("mining_equipment").select("*").order("created_at", { ascending: false })).data ?? [] });
  const { data: rep } = useQuery({ queryKey: ["admin-reports"], queryFn: async () => (await supabase.from("mining_reports").select("*").order("period_end", { ascending: false })).data ?? [] });
  const { data: exp } = useQuery({ queryKey: ["admin-expenses"], queryFn: async () => (await supabase.from("mining_expenses").select("*").order("incurred_on", { ascending: false })).data ?? [] });
  const [e1, setE1] = useState({ model: "", serial_number: "", location: "", hashrate_ths: "" });
  const [r1, setR1] = useState({ period_start: "", period_end: "", pool_name: "", btc_mined: "", pool_fees_btc: "", btc_usd_price: "" });
  const [x1, setX1] = useState({ category: "electricity", amount_usd: "", incurred_on: "", description: "" });
  const addEq = useMutation({ mutationFn: async () => { if (!e1.model.trim()) throw new Error("model"); const { error } = await supabase.from("mining_equipment").insert({ ...e1, hashrate_ths: e1.hashrate_ths ? Number(e1.hashrate_ths) : null }); if (error) throw error; }, onSuccess: () => { setE1({ model: "", serial_number: "", location: "", hashrate_ths: "" }); qc.invalidateQueries({ queryKey: ["admin-equipment"] }); }, onError: rpcErr });
  const addRep = useMutation({ mutationFn: async () => { const { error } = await supabase.from("mining_reports").insert({ period_start: r1.period_start, period_end: r1.period_end, pool_name: r1.pool_name || null, btc_mined: Number(r1.btc_mined || 0), pool_fees_btc: Number(r1.pool_fees_btc || 0), btc_usd_price: r1.btc_usd_price ? Number(r1.btc_usd_price) : null, price_timestamp: r1.btc_usd_price ? new Date().toISOString() : null }); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reports"] }), onError: rpcErr });
  const addExp = useMutation({ mutationFn: async () => { const { error } = await supabase.from("mining_expenses").insert({ category: x1.category, amount_usd: Number(x1.amount_usd), incurred_on: x1.incurred_on, description: x1.description || null }); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-expenses"] }), onError: rpcErr });
  const pub = async (id: string, v: boolean) => { const { error } = await supabase.from("mining_reports").update({ published: v }).eq("id", id); if (error) toast.error(error.message); qc.invalidateQueries({ queryKey: ["admin-reports"] }); };
  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">{tx("أدخل بيانات حقيقية مُتحقَّق منها فقط (فواتير، تقارير المجمّع). لا تُوزَّع أي أرباح تلقائياً.", "Enter only real, verified data (invoices, pool reports). No profits are distributed automatically.")}</p>
      <Panel title={tx("الأجهزة", "Equipment")}>
        <div className="mb-4 grid gap-2 md:grid-cols-5">{(["model", "serial_number", "location", "hashrate_ths"] as const).map((k) => <Input key={k} placeholder={k} value={e1[k]} onChange={(e) => setE1({ ...e1, [k]: e.target.value })} />)}<Button variant="hero" onClick={() => addEq.mutate()}>{tx("إضافة", "Add")}</Button></div>
        <Table head={["Model", "Serial", "Location", "TH/s", "Status"]} rows={(eq ?? []).map((x) => [x.model, x.serial_number ?? "—", x.location ?? "—", x.hashrate_ths ?? "—", <StatusBadge key="s" s={x.status} />])} />
      </Panel>
      <Panel title={tx("تقارير التعدين", "Mining reports")}>
        <div className="mb-4 grid gap-2 md:grid-cols-7"><Input type="date" value={r1.period_start} onChange={(e) => setR1({ ...r1, period_start: e.target.value })} /><Input type="date" value={r1.period_end} onChange={(e) => setR1({ ...r1, period_end: e.target.value })} />{(["pool_name", "btc_mined", "pool_fees_btc", "btc_usd_price"] as const).map((k) => <Input key={k} placeholder={k} value={r1[k]} onChange={(e) => setR1({ ...r1, [k]: e.target.value })} />)}<Button variant="hero" onClick={() => addRep.mutate()}>{tx("إضافة", "Add")}</Button></div>
        <Table head={["Period", "Pool", "BTC", "Fees", "BTC/USD", "Published"]} rows={(rep ?? []).map((r) => [`${r.period_start} → ${r.period_end}`, r.pool_name ?? "—", r.btc_mined, r.pool_fees_btc, r.btc_usd_price ?? "—", <Switch key="p" checked={r.published} onCheckedChange={(c) => pub(r.id, c)} />])} />
      </Panel>
      <Panel title={tx("المصروفات التشغيلية", "Operating expenses")}>
        <div className="mb-4 grid gap-2 md:grid-cols-5"><select value={x1.category} onChange={(e) => setX1({ ...x1, category: e.target.value })} className="rounded-md border border-input bg-background px-2 text-sm">{["electricity", "maintenance", "hosting", "other"].map((c) => <option key={c}>{c}</option>)}</select><Input placeholder="USD" value={x1.amount_usd} onChange={(e) => setX1({ ...x1, amount_usd: e.target.value })} /><Input type="date" value={x1.incurred_on} onChange={(e) => setX1({ ...x1, incurred_on: e.target.value })} /><Input placeholder="description" value={x1.description} onChange={(e) => setX1({ ...x1, description: e.target.value })} /><Button variant="hero" onClick={() => addExp.mutate()}>{tx("إضافة", "Add")}</Button></div>
        <Table head={["Category", "USD", "Date", "Description"]} rows={(exp ?? []).map((x) => [x.category, `$${x.amount_usd}`, x.incurred_on, x.description ?? "—"])} />
      </Panel>
    </div>
  );
}

function Audit() {
  const { tx } = useI18n();
  const { data } = useQuery({ queryKey: ["admin-audit"], queryFn: async () => (await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300)).data ?? [] });
  return <Panel title={tx("سجل التدقيق", "Audit log")}><Table head={[tx("الإجراء", "Action"), tx("الهدف", "Target"), tx("المنفّذ", "Actor"), tx("التفاصيل", "Details"), tx("التاريخ", "Date")]} rows={(data ?? []).map((a) => [a.action, `${a.target_type}:${a.target_id?.slice(0, 8)}`, <span key="u" className="font-mono text-xs">{a.actor_id?.slice(0, 8)}</span>, <code key="d" className="text-xs">{JSON.stringify(a.details).slice(0, 80)}</code>, fmtDate(a.created_at)])} /></Panel>;
            }

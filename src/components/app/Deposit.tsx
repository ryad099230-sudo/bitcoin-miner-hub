import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty, Loading, Panel, StatusBadge, Table, fmtDate } from "./ui-bits";
import { useSiteSettings } from "@/components/site/ProfitCalculator";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { canRetryDeposit, depositErrorMessage, supportedDepositNetwork, transactionExplorer, validDepositAmount, validTransactionHash } from "@/lib/deposits";

type DepositRow = Database["public"]["Tables"]["deposits"]["Row"];

export function Deposit() {
  const { tx, lang } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: settings } = useSiteSettings();
  const [networkId, setNetworkId] = useState("");
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<DepositRow | null>(null);
  const [hash, setHash] = useState("");
  const [feedback, setFeedback] = useState("");
  const networks = useQuery({ queryKey: ["deposit-networks", user?.id], queryFn: async () => {
    const { data, error } = await supabase.from("supported_networks").select("*").eq("enabled", true).eq("verified", true).order("asset");
    if (error) throw error;
    return (data ?? []).filter(n => supportedDepositNetwork(n) && !!n.deposit_address?.trim());
  } });
  const history = useQuery({ queryKey: ["deposits", user?.id], enabled: !!user, queryFn: async () => {
    if (!user) throw new Error("Unauthorized");
    const { data, error } = await supabase.from("deposits").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return data;
  } });
  const current = history.data?.find(d => d.id === selected?.id) ?? selected;
  const network = networks.data?.find(n => n.id === networkId);
  const available = !!settings?.deposits_enabled && !!networks.data?.length;
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); toast.success(tx("تم النسخ", "Copied")); }
    catch { toast.error(tx("تعذّر النسخ؛ انسخ النص يدوياً.", "Unable to copy; copy the text manually.")); }
  };
  const create = useMutation({ mutationFn: async () => {
    if (!network || !validDepositAmount(amount, network.min_deposit, network.decimals)) throw new Error("invalid amount");
    const { data, error } = await supabase.rpc("create_deposit", { _network_id: network.id, _amount: Number(amount) });
    if (error) throw error;
    return data as DepositRow;
  }, onSuccess: d => { setSelected(d); setHash(""); setFeedback(""); qc.invalidateQueries({ queryKey: ["deposits"] }); toast.success(tx("تم إنشاء طلب الإيداع", "Deposit request created")); }, onError: e => toast.error(depositErrorMessage(e, lang)) });
  const verify = useMutation({ mutationFn: async () => {
    if (!current || !canRetryDeposit(current) || !validTransactionHash(hash)) throw new Error("invalid tx hash");
    // Never trust amounts, wallet addresses or a claimed success from the browser.
    const { data, error } = await supabase.functions.invoke("verify-deposit", { body: { deposit_id: current.id, tx_hash: hash.trim() } });
    if (error) {
      if ("context" in error && error.context instanceof Response) {
        const body = await error.context.clone().json().catch(() => null);
        if (body?.error || body?.message) throw new Error(String(body.error ?? body.message));
      }
      throw error;
    }
    if (data?.error || data?.success === false || data?.ok === false) throw new Error(String(data.error ?? data.message ?? "Verification failed"));
    // Re-read the owned row; an HTTP response alone never credits or confirms it.
    const { data: fresh, error: readError } = await supabase.from("deposits").select("*").eq("id", current.id).eq("user_id", current.user_id).single();
    if (readError) throw readError;
    return fresh;
  }, onSuccess: async d => {
    setSelected(d); setFeedback("");
    await qc.invalidateQueries({ queryKey: ["deposits"] });
    if (d.status === "confirmed") {
      await Promise.all(["summary", "ledger", "notifications", "refstats", "commissions"].map(key => qc.invalidateQueries({ queryKey: [key] })));
      toast.success(tx("تم تأكيد الإيداع", "Deposit confirmed"));
    } else setFeedback(tx("لم يُؤكد الإيداع بعد. يمكنك إعادة التحقق من الطلب نفسه.", "The deposit is not confirmed yet. You can recheck this same request."));
  }, onError: e => { const message = depositErrorMessage(e, lang); setFeedback(message); toast.error(message); qc.invalidateQueries({ queryKey: ["deposits"] }); } });
  const open = (d: DepositRow) => { setSelected(d); setHash(d.tx_hash ?? ""); setFeedback(""); };
  return <>
    <h1 className="text-2xl font-bold">{tx("الإيداع", "Deposit")}</h1>
    <Panel title={current ? tx("طلب الإيداع", "Deposit request") : tx("طلب إيداع جديد", "New deposit")}>
      {current ? <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3"><span className="font-mono text-sm">{current.reference}</span><StatusBadge s={current.status} /></div>
        <div className="flex items-start gap-2"><p dir="ltr" className="min-w-0 flex-1 break-all rounded-lg border border-border bg-background p-3 font-mono text-sm">{current.destination_address}</p><Button variant="secondary" size="icon" title={tx("نسخ عنوان المحفظة", "Copy wallet address")} aria-label={tx("نسخ عنوان المحفظة", "Copy wallet address")} onClick={() => copy(current.destination_address)}><Copy /></Button></div>
        <p dir="ltr" className="font-semibold">{current.expected_amount} {current.asset} · {current.network}</p>
        <p className="text-sm text-muted-foreground">{tx("التأكيدات", "Confirmations")}: {current.confirmations} · {tx("الصلاحية", "Expires")}: {fmtDate(current.expires_at)}</p>
        <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">{tx("لا تُرسل أموالاً إذا كانت الإيداعات معطّلة. تأكد من الشبكة والعنوان؛ لا يُضاف رصيد قبل التحقق الفعلي.", "Do not send funds when deposits are disabled. Check the network and address; no balance is credited before actual verification.")}</p>
        {canRetryDeposit(current) && supportedDepositNetwork(current) && <form className="space-y-3" onSubmit={e => { e.preventDefault(); if (!verify.isPending && validTransactionHash(hash)) verify.mutate(); }}>
          <Label htmlFor="deposit-tx">{tx("معرّف المعاملة TX Hash", "Transaction hash")}</Label>
          <Input id="deposit-tx" dir="ltr" value={hash} onChange={e => setHash(e.target.value)} maxLength={64} autoComplete="off" spellCheck={false} aria-invalid={!!hash && !validTransactionHash(hash)} />
          {!!hash && !validTransactionHash(hash) && <p className="text-sm text-destructive">{tx("يلزم معرّف من 64 خانة سداسية عشرية.", "A 64-character hexadecimal hash is required.")}</p>}
          <Button type="submit" variant="hero" disabled={verify.isPending || !validTransactionHash(hash)}>{verify.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}{tx("تحقق من الإيداع", "Verify deposit")}</Button>
        </form>}
        {feedback && <p role="alert" className="text-sm text-warning">{feedback}</p>}
        <Button variant="secondary" disabled={verify.isPending} onClick={() => { setSelected(null); setHash(""); setFeedback(""); }}>{tx("العودة", "Back")}</Button>
      </div> : networks.isPending ? <Loading /> : networks.error ? <p role="alert" className="text-sm text-destructive">{depositErrorMessage(networks.error, lang)}</p> : !available ? <Empty text={tx("الإيداعات غير متاحة حالياً. لم تُفعّل شبكة بعنوان استلام مُتحقَّق منه؛ لا ترسل أي أموال.", "Deposits are currently unavailable. No network with a verified receiving address is enabled; do not send funds.")} /> : <form className="grid gap-4 md:grid-cols-2" onSubmit={e => { e.preventDefault(); if (!create.isPending) create.mutate(); }}>
        <div className="space-y-2"><Label htmlFor="deposit-network">{tx("الأصل والشبكة", "Asset & network")}</Label><select id="deposit-network" value={networkId} onChange={e => setNetworkId(e.target.value)} required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">{tx("اختر…", "Select…")}</option>{networks.data?.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor="deposit-amount">{tx("المبلغ", "Amount")}{network && ` (${tx("الحد الأدنى", "Minimum")}: ${network.min_deposit} ${network.asset})`}</Label><Input id="deposit-amount" dir="ltr" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} required /></div>
        <Button variant="hero" type="submit" className="md:col-span-2" disabled={create.isPending || !network || !validDepositAmount(amount, network.min_deposit, network.decimals)}>{create.isPending && <Loader2 className="animate-spin" />}{tx("إنشاء طلب الإيداع", "Create deposit request")}</Button>
      </form>}
    </Panel>
    <Panel title={tx("سجل الإيداعات", "Deposit history")} action={<Button variant="ghost" size="icon" aria-label={tx("تحديث السجل", "Refresh history")} title={tx("تحديث السجل", "Refresh history")} onClick={() => history.refetch()} disabled={history.isFetching}><RefreshCw className={history.isFetching ? "animate-spin" : ""} /></Button>}>
      {history.isPending ? <Loading /> : history.error ? <p role="alert" className="text-destructive">{depositErrorMessage(history.error, lang)}</p> : <Table head={[tx("المرجع", "Reference"), tx("الأصل والشبكة", "Asset & network"), tx("المطلوب", "Requested"), tx("المستلم", "Received"), "USD", "TX", tx("التأكيدات", "Confirmations"), tx("الحالة", "Status"), tx("تاريخ الطلب", "Requested at"), tx("تاريخ التأكيد", "Confirmed at"), tx("الإجراء", "Action")]} rows={(history.data ?? []).map(d => {
        const url = transactionExplorer(d, d.tx_hash);
        return [d.reference, `${d.asset} · ${d.network}`, d.expected_amount, d.received_amount ?? "—", d.usd_value ?? "—", <div key="tx" className="flex items-center gap-1">{d.tx_hash ? <><span dir="ltr" className="font-mono text-xs" title={d.tx_hash}>{d.tx_hash.slice(0, 8)}…{d.tx_hash.slice(-8)}</span><Button size="icon" variant="ghost" title={tx("نسخ معرّف المعاملة", "Copy transaction hash")} aria-label={tx("نسخ معرّف المعاملة", "Copy transaction hash")} onClick={() => copy(d.tx_hash ?? "")}><Copy /></Button>{url && <Button asChild variant="ghost" size="icon"><a href={url} target="_blank" rel="noopener noreferrer" aria-label={tx("عرض المعاملة", "View transaction")} title={tx("عرض المعاملة", "View transaction")}><ExternalLink /></a></Button>}</> : "—"}</div>, d.confirmations, <StatusBadge key="status" s={d.status} />, fmtDate(d.created_at), fmtDate(d.confirmed_at), <Button key="open" variant="secondary" size="sm" onClick={() => open(d)} disabled={verify.isPending}>{tx("عرض", "View")}</Button>];
      })} />}
    </Panel>
  </>;
}
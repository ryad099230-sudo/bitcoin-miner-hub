import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function StatCard({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: string; tone?: "gold" | "muted" }) {
  return (
    <div className={`rounded-xl border p-5 ${tone === "gold" ? "border-primary/50 bg-primary/10" : "border-border bg-card-gradient"} shadow-card`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold ${tone === "gold" ? "text-gold" : ""}`} dir="ltr">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card-gradient p-5 shadow-card md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Loading() {
  return <div className="grid place-items-center py-10"><Loader2 className="size-6 animate-spin text-primary" /></div>;
}

export function Empty({ text }: { text?: string }) {
  const { t } = useI18n();
  return <p className="py-8 text-center text-sm text-muted-foreground">{text ?? t("empty")}</p>;
}

const tones: Record<string, string> = {
  confirmed: "bg-success/15 text-success", completed: "bg-success/15 text-success", paid: "bg-success/15 text-success", approved: "bg-success/15 text-success", active: "bg-success/15 text-success", verified: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive", cancelled: "bg-destructive/15 text-destructive", expired: "bg-destructive/15 text-destructive", reversed: "bg-destructive/15 text-destructive", suspended: "bg-destructive/15 text-destructive",
};
export function StatusBadge({ s }: { s: string }) {
  const { tx } = useI18n();
  const labels: Record<string, [string, string]> = {
    created: ["تم إنشاء الطلب", "Request created"], awaiting_payment: ["بانتظار التحويل", "Awaiting transfer"], detected: ["تم العثور على التحويل", "Transfer detected"], confirming: ["قيد التأكيدات", "Confirming"], confirmed: ["تم تأكيد الإيداع", "Confirmed"], rejected: ["مرفوض", "Rejected"], expired: ["منتهي الصلاحية", "Expired"], active: ["نشط", "Active"], verified: ["مُتحقَّق", "Verified"], unverified: ["غير مُتحقَّق", "Unverified"], pending: ["معلّق", "Pending"], approved: ["معتمد", "Approved"], paid: ["مدفوع", "Paid"], completed: ["مكتمل", "Completed"], suspended: ["موقوف", "Suspended"], cancelled: ["ملغى", "Cancelled"], reversed: ["معكوس", "Reversed"], requested: ["تم الطلب", "Requested"], broadcast: ["تم البث", "Broadcast"], recorded: ["مسجل", "Recorded"]
  };
  const label = labels[s];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[s] ?? "bg-warning/15 text-warning"}`}>{label ? tx(label[0], label[1]) : s}</span>;
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  if (!rows.length) return <Empty />;
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border text-muted-foreground">{head.map((h) => <th key={h} className="px-3 py-2 text-start font-medium whitespace-nowrap">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-b border-border/50 last:border-0">{r.map((c, j) => <td key={j} className="px-3 py-2.5 whitespace-nowrap">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export const fmtDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) : "—");

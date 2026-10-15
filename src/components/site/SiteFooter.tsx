import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t, tx } = useI18n();
  const learn = [
    ["/how-mining-works", t("nav_how")],
    ["/mining-operations", tx("عمليات التعدين", "Mining Operations")],
    ["/calculator", t("nav_calc")],
    ["/faq", t("nav_faq")],
    ["/contact", tx("الدعم والتواصل", "Contact & Support")],
  ] as const;
  const legal = [
    ["/investment-terms", tx("شروط الاستثمار", "Investment Terms")],
    ["/risk-disclosure", tx("الإفصاح عن المخاطر", "Risk Disclosure")],
    ["/fees", tx("الرسوم وسياسة السحب", "Fees & Withdrawals")],
    ["/referral-terms", tx("شروط الإحالة", "Referral Terms")],
    ["/privacy", tx("سياسة الخصوصية", "Privacy Policy")],
    ["/terms", tx("شروط الخدمة", "Terms of Service")],
  ] as const;
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold">{t("brand")}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("footer_risk")}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-primary">{t("learn")}</p>
          <ul className="space-y-2 text-sm">{learn.map(([to, l]) => <li key={to}><Link to={to} className="text-muted-foreground hover:text-foreground">{l}</Link></li>)}</ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-primary">{t("legal")}</p>
          <ul className="space-y-2 text-sm">{legal.map(([to, l]) => <li key={to}><Link to={to} className="text-muted-foreground hover:text-foreground">{l}</Link></li>)}</ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} {t("brand")}</div>
    </footer>
  );
}

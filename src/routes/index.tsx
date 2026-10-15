import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftRight, BarChart3, Cpu, Gift, Headphones, History, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfitCalculator, useSiteSettings } from "@/components/site/ProfitCalculator";
import { useI18n } from "@/lib/i18n";
import hero from "@/assets/hero-mining.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bitcoin Mining Investment — اكتشف عالم الاستثمار في تعدين البيتكوين" },
      { name: "description", content: "Explore Bitcoin mining, calculate an illustrative investment scenario, and review operations, fees, and terms before creating an account." },
      { property: "og:title", content: "Bitcoin Mining Investment" },
      { property: "og:description", content: "Explore Bitcoin mining and calculate an illustrative investment scenario before creating an account." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t, tx } = useI18n();
  const { data: s } = useSiteSettings();
  const deposits = !!s?.deposits_enabled;
  const withdrawals = !!s?.withdrawals_enabled;

  const features = [
    { icon: Cpu, title: tx("عمليات تعدين البيتكوين", "Bitcoin Mining Operations"), desc: tx("سجلات الأجهزة والتقارير التشغيلية تُدار من لوحة الإدارة.", "Equipment and operating records managed from the admin console."), live: true },
    { icon: BarChart3, title: tx("تقارير إيرادات التعدين", "Mining Revenue Reporting"), desc: tx("فصل الإيراد الإجمالي والتكاليف والصافي والتوزيعات.", "Gross revenue, costs, net, and distributions kept separate."), live: true },
    { icon: Wallet, title: tx("تتبّع الاستثمار", "Investment Tracking"), desc: tx("أرصدة مستمدة من دفتر حسابات موثوق في قاعدة البيانات.", "Balances derived from a trusted database ledger."), live: true },
    { icon: ShieldCheck, title: tx("دخول آمن للحساب", "Secure Account Access"), desc: tx("تحقق بالبريد، وإعادة تعيين كلمة المرور، وجلسات محمية.", "Email verification, password reset, protected sessions."), live: true },
    { icon: ArrowLeftRight, title: tx("إيداعات العملات الرقمية", "Cryptocurrency Deposits"), desc: tx("BTC وUSDT على الشبكات المُتحقَّق منها فقط.", "BTC and USDT on verified networks only."), live: deposits && withdrawals },
    { icon: Gift, title: tx("مكافآت الإحالة", "Referral Rewards"), desc: tx("عمولة 1% لمرة واحدة على الإيداعات المؤكَّدة.", "One-time 1% commission on confirmed deposits."), live: true },
    { icon: History, title: tx("سجل المعاملات", "Transaction History"), desc: tx("كل حركة مالية مسجّلة ولا يمكن تعديلها.", "Every financial movement recorded immutably."), live: true },
    { icon: Headphones, title: tx("دعم العملاء", "Customer Support"), desc: tx("مساعدة بخصوص الحساب والعمليات.", "Help with your account and operations."), live: true },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt={tx("مركز بيانات لتعدين البيتكوين", "Bitcoin mining data center")} width={1920} height={1088} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="container-page flex min-h-[86vh] flex-col justify-center py-24">
          <span className="w-fit rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">₿ {t("brand")}</span>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight md:text-6xl md:leading-[1.15]">
            <span className="text-gold">{t("hero_title")}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/85">{t("hero_sub")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl"><a href="#calculator">{t("cta_calc")}</a></Button>
            <Button asChild variant="glass" size="xl"><Link to="/auth" search={{ mode: "signup" }}>{t("cta_signup")}</Link></Button>
            <Button asChild variant="link" size="xl"><Link to="/how-mining-works">{t("cta_how")}</Link></Button>
          </div>
        </div>
      </section>

      <section id="calculator" className="container-page scroll-mt-20 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold md:text-4xl">{t("calc_title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("calc_sub")}</p>
          <div className="mt-10"><ProfitCalculator /></div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-3xl font-bold md:text-4xl">{t("features_title")}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("features_sub")}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card-gradient p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/50">
              <div className="flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary"><f.icon className="size-5" /></span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${f.live ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{f.live ? t("status_live") : t("status_setup")}</span>
              </div>
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="rounded-3xl border border-primary/30 bg-card-gradient p-10 text-center shadow-gold">
          <h2 className="text-2xl font-bold md:text-3xl">{tx("اطّلع على الشروط والمخاطر قبل البدء", "Review the terms and risks before you start")}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="lg"><Link to="/risk-disclosure">{tx("الإفصاح عن المخاطر", "Risk Disclosure")}</Link></Button>
            <Button asChild variant="secondary" size="lg"><Link to="/investment-terms">{tx("شروط الاستثمار", "Investment Terms")}</Link></Button>
            <Button asChild variant="secondary" size="lg"><Link to="/fees">{tx("الرسوم", "Fees")}</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}

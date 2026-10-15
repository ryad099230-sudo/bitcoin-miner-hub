import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { calculateIllustrative, formatUSD, MAX_INVESTMENT } from "@/lib/money";

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });
}

const DURATIONS = [1, 3, 6, 12];

export function ProfitCalculator() {
  const { t, lang } = useI18n();
  const { data: settings } = useSiteSettings();
  const rate = Number(settings?.calculator_monthly_rate ?? 0.01);
  const min = Number(settings?.min_investment_usd ?? 10);
  const [amount, setAmount] = useState("100");
  const [months, setMonths] = useState(1);

  const n = Number(amount);
  const valid = amount.trim() !== "" && /^\d+(\.\d{1,2})?$/.test(amount.trim()) && n >= min && n <= MAX_INVESTMENT;
  const result = useMemo(() => (valid ? calculateIllustrative(amount.trim(), String(rate), months) : null), [valid, amount, rate, months]);
  const pct = (rate * 100).toLocaleString("en-US", { maximumFractionDigits: 4 });

  const cards = [
    { label: t("calc_initial"), value: result?.initial },
    { label: t("calc_profit"), value: result?.profit },
    { label: t("calc_total"), value: result?.total, gold: true },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card-gradient p-6 shadow-card md:p-8">
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-2">
          <Label htmlFor="calc-amount">{t("calc_amount")}</Label>
          <Input
            id="calc-amount"
            inputMode="decimal"
            dir="ltr"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            className="h-12 text-lg font-semibold"
            aria-invalid={!valid}
          />
          <p className={`text-xs ${valid ? "text-muted-foreground" : "text-destructive"}`}>
            {valid ? `${t("calc_min")}: ${formatUSD(min, lang)} · ${t("calc_max")}` : `${t("calc_invalid")} (${t("calc_min")}: ${formatUSD(min, lang)} · ${t("calc_max")})`}
          </p>
        </div>
        <div className="space-y-2">
          <Label>{t("calc_duration")}</Label>
          <div className="grid grid-cols-4 gap-2" role="radiogroup">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={months === d}
                onClick={() => setMonths(d)}
                className={`h-12 rounded-lg border text-sm font-medium transition-colors ${months === d ? "border-primary bg-primary/15 text-primary" : "border-border hover:border-primary/50"}`}
              >
                {d} {t("calc_months")}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("calc_rate")}: <span className="font-semibold text-primary">{pct}%</span> · {t("calc_formula")}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl border p-5 ${c.gold ? "border-primary/50 bg-primary/10" : "border-border bg-background/40"}`}>
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className={`mt-2 font-display text-2xl font-bold md:text-3xl ${c.gold ? "text-gold" : ""}`} dir="ltr">
              {c.value ? formatUSD(c.value, lang) : "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm leading-relaxed">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
        <p>{t("calc_notice")}</p>
      </div>

      <div className="mt-6 flex justify-center">
        <Button asChild variant="hero" size="xl">
          <Link to="/auth" search={{ mode: "signup" }}>{t("calc_cta")}</Link>
        </Button>
      </div>
    </div>
  );
}

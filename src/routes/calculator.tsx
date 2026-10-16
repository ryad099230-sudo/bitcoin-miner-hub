import { createFileRoute } from "@tanstack/react-router";
import { ProfitCalculator } from "@/components/site/ProfitCalculator";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Profit Calculator — Nova Invest" },
      { name: "description", content: "Calculate an illustrative simple-interest mining investment scenario without registering." },
      { property: "og:title", content: "Profit Calculator — Nova Invest" },
      { property: "og:description", content: "Calculate an illustrative simple-interest mining investment scenario without registering." },
    ],
  }),
  component: CalcPage,
});

function CalcPage() {
  const { t } = useI18n();
  return (
    <div className="container-page max-w-5xl py-16">
      <h1 className="text-3xl font-bold md:text-5xl">{t("calc_title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("calc_sub")}</p>
      <div className="mt-10"><ProfitCalculator /></div>
    </div>
  );
}

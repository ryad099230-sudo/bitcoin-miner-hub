import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Bitcoin Mining Investment" },
      { name: "description", content: "Answers about returns, deposits, withdrawals, referrals, and risk." },
      { property: "og:title", content: "FAQ — Bitcoin Mining Investment" },
      { property: "og:description", content: "Answers about returns, deposits, withdrawals, referrals, and risk." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t, lang } = useI18n();
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-bold md:text-5xl">{t("nav_faq")}</h1>
      <Accordion type="single" collapsible className="mt-10 rounded-2xl border border-border bg-card-gradient px-6">
        {FAQ.map((f, i) => (
          <AccordionItem key={i} value={String(i)}>
            <AccordionTrigger className="text-start text-base">{f.q[lang]}</AccordionTrigger>
            <AccordionContent className="leading-loose text-muted-foreground">{f.a[lang]}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

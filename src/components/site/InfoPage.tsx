import { useI18n } from "@/lib/i18n";
import { PAGES, type PageKey } from "@/lib/content";

export function InfoPage({ page }: { page: PageKey }) {
  const { lang } = useI18n();
  const p = PAGES[page];
  return (
    <div className="container-page max-w-3xl py-16">
      <p className="text-sm font-medium text-primary">{lang === "ar" ? p.kicker.ar : p.kicker.en}</p>
      <h1 className="mt-2 text-3xl font-bold md:text-5xl">{lang === "ar" ? p.title.ar : p.title.en}</h1>
      <div className="mt-10 space-y-8">
        {p.sections.map((s, i) => (
          <section key={i} className="rounded-2xl border border-border bg-card-gradient p-6 shadow-card">
            <h2 className="text-xl font-semibold">{lang === "ar" ? s.h.ar : s.h.en}</h2>
            <p className="mt-3 leading-loose text-muted-foreground">{lang === "ar" ? s.p.ar : s.p.en}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 text-xs text-muted-foreground">
        {lang === "ar"
          ? "هذه الصفحة نموذج أولي يجب مراجعته من مستشار قانوني قبل الإطلاق للعامة."
          : "This page is a draft template and must be reviewed by legal counsel before public launch."}
      </p>
    </div>
  );
}

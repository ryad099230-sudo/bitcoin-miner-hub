import { Link, useNavigate } from "@tanstack/react-router";
import { Bitcoin, Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: "/", label: t("nav_home") },
    { to: "/how-mining-works", label: t("nav_how") },
    { to: "/calculator", label: t("nav_calc") },
    { to: "/investment-terms", label: t("nav_invest") },
    { to: "/referral-terms", label: t("nav_ref") },
    { to: "/faq", label: t("nav_faq") },
  ] as const;

  const out = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold">
          <span className="grid size-9 place-items-center rounded-lg bg-gold text-primary-foreground shadow-gold">
            <Bitcoin className="size-5" />
          </span>
          <span className="hidden sm:inline">{t("brand")}</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setLang(lang === "ar" ? "en" : "ar")} aria-label="Language">
            <Globe /> {lang === "ar" ? "EN" : "عربي"}
          </Button>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                {isAdmin && <Button asChild variant="ghost" size="sm"><Link to="/admin">{t("admin")}</Link></Button>}
                <Button asChild variant="hero" size="sm"><Link to="/dashboard">{t("dashboard")}</Link></Button>
                <Button variant="ghost" size="sm" onClick={out}>{t("logout")}</Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/auth">{t("login")}</Link></Button>
                <Button asChild variant="hero" size="sm"><Link to="/auth" search={{ mode: "signup" }}>{t("signup")}</Link></Button>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm hover:bg-accent">
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 px-3">
              {user ? (
                <>
                  <Button asChild variant="hero" className="flex-1"><Link to="/dashboard" onClick={() => setOpen(false)}>{t("dashboard")}</Link></Button>
                  {isAdmin && <Button asChild variant="secondary"><Link to="/admin" onClick={() => setOpen(false)}>{t("admin")}</Link></Button>}
                  <Button variant="secondary" onClick={out}>{t("logout")}</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="secondary" className="flex-1"><Link to="/auth" onClick={() => setOpen(false)}>{t("login")}</Link></Button>
                  <Button asChild variant="hero" className="flex-1"><Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)}>{t("signup")}</Link></Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

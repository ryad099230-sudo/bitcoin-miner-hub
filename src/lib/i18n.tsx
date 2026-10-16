import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const dict = {
  brand: { ar: "Nova Invest", en: "Nova Invest" },
  nav_home: { ar: "الرئيسية", en: "Home" },
  nav_how: { ar: "كيف يعمل التعدين", en: "How Mining Works" },
  nav_calc: { ar: "حاسبة الأرباح", en: "Profit Calculator" },
  nav_invest: { ar: "معلومات الاستثمار", en: "Investment Information" },
  nav_ref: { ar: "برنامج الإحالة", en: "Referral Program" },
  nav_faq: { ar: "الأسئلة الشائعة", en: "FAQ" },
  login: { ar: "تسجيل الدخول", en: "Login" },
  signup: { ar: "إنشاء حساب", en: "Create Account" },
  logout: { ar: "تسجيل الخروج", en: "Log out" },
  dashboard: { ar: "لوحة التحكم", en: "Dashboard" },
  admin: { ar: "الإدارة", en: "Admin" },
  hero_title: { ar: "اكتشف عالم الاستثمار في تعدين البيتكوين", en: "Explore Nova Invest" },
  hero_sub: {
    ar: "تعرّف على تعدين البيتكوين، واحسب العائد التقديري لاستثمارك، واطّلع على آلية التشغيل والرسوم والشروط قبل إنشاء حساب.",
    en: "Explore Bitcoin mining, calculate an illustrative investment scenario, and review the platform's mining operations, fees, and terms before creating an account.",
  },
  cta_calc: { ar: "احسب أرباحك", en: "Calculate Your Profit" },
  cta_signup: { ar: "ابدأ الآن", en: "Get Started" },
  cta_how: { ar: "كيف يعمل التعدين", en: "How Mining Works" },
  features_title: { ar: "ما تقدّمه المنصّة", en: "What the platform offers" },
  features_sub: {
    ar: "تُعرض الميزات قيد الإعداد بوضوح، ولا تُقدَّم أي خدمة على أنها تعمل قبل تفعيلها والتحقق منها.",
    en: "Features still being configured are labeled clearly. Nothing is presented as live before it is enabled and verified.",
  },
  status_live: { ar: "متاح", en: "Available" },
  status_setup: { ar: "قيد الإعداد", en: "Being configured" },
  calc_title: { ar: "حاسبة الأرباح التقديرية", en: "Illustrative Profit Calculator" },
  calc_sub: { ar: "متاحة للجميع دون تسجيل. الحساب بفائدة بسيطة غير مركّبة.", en: "Available to everyone without registration. Simple, non-compounding interest." },
  calc_amount: { ar: "مبلغ الاستثمار (دولار)", en: "Investment amount (USD)" },
  calc_duration: { ar: "المدة", en: "Duration" },
  calc_months: { ar: "شهر", en: "mo" },
  calc_rate: { ar: "المعدل الشهري الافتراضي", en: "Illustrative monthly rate" },
  calc_initial: { ar: "الاستثمار الأولي", en: "Initial Investment" },
  calc_profit: { ar: "الربح التقديري", en: "Illustrative Estimated Profit" },
  calc_total: { ar: "الإجمالي التقديري", en: "Illustrative Estimated Total" },
  calc_formula: { ar: "الربح = المبلغ × المعدل الشهري × عدد الأشهر", en: "Profit = amount × monthly rate × months" },
  calc_min: { ar: "الحد الأدنى", en: "Minimum" },
  calc_max: { ar: "الحد الأقصى 1,000,000$", en: "Maximum $1,000,000" },
  calc_invalid: { ar: "أدخل مبلغاً صحيحاً", en: "Enter a valid amount" },
  calc_cta: { ar: "أنشئ حساباً للبدء", en: "Create an Account to Get Started" },
  calc_notice: {
    ar: "حساب توضيحي فقط. المعدل الشهري المختار افتراض وليس عائداً مضموناً. تعتمد إيرادات التعدين الفعلية على الأداء التشغيلي المُتحقَّق منه، وصعوبة التعدين، وأسعار البيتكوين، والكهرباء، والصيانة، والرسوم، وتكاليف أخرى. قد تكون التوزيعات الفعلية أقل أو صفراً، وقد يكون رأس المال معرّضاً للخطر.",
    en: "Illustrative calculation only. The selected monthly rate is an assumption, not a guaranteed return. Actual mining revenue depends on verified operating performance, mining difficulty, Bitcoin market prices, electricity, maintenance, fees, and other costs. Actual distributions may be lower or zero, and capital may be at risk.",
  },
  footer_risk: {
    ar: "الاستثمار في تعدين العملات الرقمية ينطوي على مخاطر عالية وقد تخسر جزءاً من رأس مالك أو كله. لا تدّعي المنصّة أي ترخيص أو تدقيق لم يتم التحقق منه بشكل مستقل.",
    en: "Crypto mining investment carries high risk and you may lose some or all of your capital. The platform claims no license or audit that has not been independently verified.",
  },
  legal: { ar: "قانوني", en: "Legal" },
  learn: { ar: "تعرّف", en: "Learn" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  password: { ar: "كلمة المرور", en: "Password" },
  confirm_password: { ar: "تأكيد كلمة المرور", en: "Confirm password" },
  full_name: { ar: "الاسم الكامل", en: "Full name" },
  ref_code_opt: { ar: "رمز الإحالة (اختياري)", en: "Referral code (optional)" },
  forgot: { ar: "نسيت كلمة المرور؟", en: "Forgot password?" },
  loading: { ar: "جارٍ التحميل…", en: "Loading…" },
  save: { ar: "حفظ", en: "Save" },
  cancel: { ar: "إلغاء", en: "Cancel" },
  empty: { ar: "لا توجد سجلات بعد", en: "No records yet" },
} as const;

export type TKey = keyof typeof dict;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string; dir: "rtl" | "ltr"; tx: (ar: string, en: string) => string };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "ar") setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => {
    localStorage.setItem("lang", l);
    setLangState(l);
  };
  const value: Ctx = {
    lang,
    setLang,
    dir: lang === "ar" ? "rtl" : "ltr",
    t: (k) => dict[k][lang],
    tx: (ar, en) => (lang === "ar" ? ar : en),
  };
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}

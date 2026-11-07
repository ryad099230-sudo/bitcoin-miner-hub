type L = { ar: string; en: string };
type Page = { kicker: L; title: L; sections: { h: L; p: L }[] };

const s = (har: string, hen: string, par: string, pen: string) => ({ h: { ar: har, en: hen }, p: { ar: par, en: pen } });

export const PAGES = {
  how: {
    kicker: { ar: "تعلّم", en: "Learn" },
    title: { ar: "كيف يعمل تعدين البيتكوين", en: "How Bitcoin Mining Works" },
    sections: [
      s("ما هو التعدين؟", "What is mining?", "التعدين هو عملية تشغيل أجهزة متخصصة (ASIC) لحل مسائل حسابية تؤمّن شبكة البيتكوين. يحصل المعدّن الذي يجد الكتلة التالية على مكافأة الكتلة ورسوم المعاملات.", "Mining runs specialized hardware (ASICs) to solve computations that secure the Bitcoin network. The miner who finds the next block receives the block reward plus transaction fees."),
      s("مجمّعات التعدين", "Mining pools", "تنضم معظم العمليات إلى مجمّعات تعدين تجمع قوة الحوسبة وتوزّع المكافآت بشكل متناسب بعد خصم رسوم المجمّع.", "Most operations join mining pools that combine hash power and distribute rewards proportionally after pool fees."),
      s("ما الذي يحدد الإيرادات؟", "What drives revenue?", "قوة التجزئة، ونسبة التشغيل، وصعوبة الشبكة، وسعر البيتكوين، وأحداث التنصيف. وتُخصم تكاليف الكهرباء والصيانة والاستضافة للوصول إلى صافي الإيراد.", "Hash rate, uptime, network difficulty, Bitcoin price, and halving events. Electricity, maintenance, and hosting costs are deducted to reach net revenue."),
      s("لماذا تتقلب العوائد؟", "Why returns fluctuate", "ترتفع صعوبة الشبكة مع انضمام معدّنين جدد، ويتغير سعر البيتكوين باستمرار. لذلك قد تنخفض الإيرادات أو تصبح سالبة بعد التكاليف، وقد تخسر المال.", "Difficulty rises as miners join and Bitcoin's price moves constantly, so revenue can fall or turn negative after costs. You may lose money."),
    ],
  },
  ops: {
    kicker: { ar: "الشفافية", en: "Transparency" },
    title: { ar: "عمليات التعدين", en: "Mining Operations" },
    sections: [
      s("نموذج التشغيل", "Operating model", "تُسجَّل بيانات الأجهزة وتقارير المجمّع والمصروفات في لوحة الإدارة. لا تُعرض أي إحصاءات تشغيلية إلا بعد إدخالها من مصادر مُتحقَّق منها ونشرها.", "Equipment data, pool reports, and expenses are recorded in the admin console. No operational statistics are shown unless entered from verified sources and published."),
      s("الفصل المحاسبي", "Accounting separation", "يُحتفظ بإجمالي الإيراد، والتكاليف التشغيلية، وصافي الإيراد، والتوزيعات الفعلية بشكل منفصل. حاسبة 1% افتراض توضيحي ولا علاقة لها بمحرك التوزيع.", "Gross revenue, operating costs, net revenue, and actual distributions are kept separate. The 1% calculator is an illustrative assumption unrelated to the distribution engine."),
    ],
  },
  invest: {
    kicker: { ar: "معلومات الاستثمار", en: "Investment Information" },
    title: { ar: "شروط الاستثمار", en: "Investment Terms" },
    sections: [
      s("الحد الأدنى", "Minimum", "الحد الأدنى للمبلغ الأولي 10 دولارات، ويمكن للإدارة تعديله.", "The minimum initial amount is $10 and may be adjusted by the administrator."),
      s("التوزيعات", "Distributions", "لا تُضمن أي عوائد. تُسجَّل التوزيعات فقط استناداً إلى صافي إيرادات التعدين المتحقَّق منها والأموال المتاحة واتفاقية الاستثمار. قد تكون التوزيعات صفراً.", "No returns are guaranteed. Distributions are recorded only from verified net mining revenue, available funds, and the investment agreement. Distributions may be zero."),
      s("الأهلية", "Eligibility", "قد تُقيَّد الخدمة في بعض الولايات القضائية، وقد يُطلب التحقق من الهوية قبل الإيداع أو السحب.", "Service may be restricted in some jurisdictions and identity verification may be required before deposits or withdrawals."),
    ],
  },
  risk: {
    kicker: { ar: "مهم", en: "Important" },
    title: { ar: "الإفصاح عن المخاطر", en: "Risk Disclosure" },
    sections: [
      s("خطر رأس المال", "Capital risk", "قد تخسر جزءاً من رأس مالك أو كله. لا توجد حماية لرأس المال.", "You may lose some or all of your capital. There is no principal protection."),
      s("مخاطر السوق والتشغيل", "Market & operational risk", "تقلبات سعر البيتكوين، وارتفاع صعوبة التعدين، وأعطال الأجهزة، وتكاليف الطاقة، والتغييرات التنظيمية قد تقلل الإيرادات أو توقفها.", "Bitcoin price volatility, rising difficulty, hardware failure, energy costs, and regulatory change may reduce or stop revenue."),
      s("مخاطر السيولة", "Liquidity risk", "قد تتأخر السحوبات أو تُعلَّق بسبب المراجعة الأمنية أو نقص السيولة أو المتطلبات القانونية.", "Withdrawals may be delayed or suspended due to security review, liquidity, or legal requirements."),
      s("الوضع التنظيمي", "Regulatory status", "لا تدّعي المنصّة أنها مرخّصة أو مدقَّقة أو معتمدة قانونياً ما لم يتم التحقق من ذلك بشكل مستقل.", "The platform does not claim to be licensed, audited, or legally approved unless independently verified."),
    ],
  },
  fees: {
    kicker: { ar: "الرسوم", en: "Fees" },
    title: { ar: "الرسوم وسياسة السحب", en: "Fees and Withdrawal Policy" },
    sections: [
      s("رسوم السحب", "Withdrawal fees", "تُحدَّد رسوم السحب والحد الأدنى لكل أصل وشبكة من قبل الإدارة وتُعرض قبل التأكيد.", "Withdrawal fees and minimums are set per asset and network by the administrator and shown before confirmation."),
      s("المعالجة", "Processing", "يتم حجز المبلغ فور قبول الطلب، ثم يراجعه المسؤول قبل البث على الشبكة. يُسجَّل معرّف المعاملة بعد البث.", "Funds are reserved when a request is accepted, reviewed by an administrator before broadcasting, and the transaction ID is recorded after broadcast."),
      s("الرفض", "Rejection", "إذا رُفض الطلب، تُعاد الأموال المحجوزة إلى رصيدك المتاح.", "If a request is rejected, the reserved funds are returned to your available balance."),
    ],
  },
  referral: {
    kicker: { ar: "برنامج الإحالة", en: "Referral Program" },
    title: { ar: "شروط برنامج الإحالة", en: "Referral Program Terms" },
    sections: [
      s("العمولة", "Commission", "عمولة لمرة واحدة بنسبة 1% (قابلة للتعديل) على المبلغ المؤكَّد المودَع من عميل أحلته مباشرة. مثال: إيداع مؤكَّد بقيمة 100$ ينتج عمولة 1$.", "A one-time 1% commission (configurable) on the confirmed deposited principal of a directly referred customer. Example: a $100 confirmed deposit yields a $1 commission."),
      s("مستوى واحد فقط", "Single level", "لا توجد عمولات متعددة المستويات. الإحالة الذاتية ممنوعة.", "No multi-level commissions. Self-referrals are prohibited."),
      s("الأهلية", "Eligibility", "لا تُحتسب العمولات على الإيداعات غير المؤكَّدة أو العوائد التقديرية. تمر العمولة بحالات: معلّقة، معتمدة، مدفوعة. قد تُلغى في حال الاسترداد أو عكس الإيداع أو الاحتيال.", "No commission on unconfirmed deposits or estimated returns. Commissions move through pending, approved, and paid. They may be reversed for refunds, reversed deposits, or fraud."),
    ],
  },
  privacy: {
    kicker: { ar: "قانوني", en: "Legal" },
    title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    sections: [
      s("البيانات التي نجمعها", "Data we collect", "الاسم والبريد الإلكتروني وسجلات المعاملات وعناوين المحافظ التي تقدمها، لأغراض تشغيل الحساب والامتثال.", "Name, email, transaction records, and wallet addresses you provide, for account operation and compliance."),
      s("الحماية", "Protection", "تُحمى البيانات بضوابط وصول على مستوى قاعدة البيانات، ولا يرى المستخدم إلا سجلاته الخاصة.", "Data is protected with database-level access controls; users only see their own records."),
      s("حقوقك", "Your rights", "يمكنك طلب الوصول إلى بياناتك أو تصحيحها عبر صفحة الدعم.", "You may request access to or correction of your data via the support page."),
    ],
  },
  terms: {
    kicker: { ar: "قانوني", en: "Legal" },
    title: { ar: "شروط الخدمة", en: "Terms of Service" },
    sections: [
      s("القبول", "Acceptance", "باستخدام المنصّة فإنك توافق على هذه الشروط وعلى الإفصاح عن المخاطر.", "By using the platform you agree to these terms and the risk disclosure."),
      s("الحساب", "Account", "أنت مسؤول عن أمان حسابك. يُحظر إنشاء حسابات متعددة أو التلاعب ببرنامج الإحالة.", "You are responsible for your account security. Multiple accounts and referral manipulation are prohibited."),
      s("عدم الضمان", "No guarantee", "لا تقدم المنصّة أي ضمان للأرباح أو لحماية رأس المال أو لتوفر السحب.", "The platform makes no guarantee of profits, principal protection, or withdrawal availability."),
    ],
  },
  contact: {
    kicker: { ar: "الدعم", en: "Support" },
    title: { ar: "التواصل والدعم", en: "Contact and Support" },
    sections: [
      s("الدعم الفني", "Support", "لأي استفسار يخص حسابك أو إيداعاتك أو سحوباتك، سجّل الدخول وافتح قسم الدعم في لوحة التحكم مع ذكر الرقم المرجعي للعملية.", "For questions about your account, deposits, or withdrawals, sign in and open Support in your dashboard, including the operation reference."),
      s("بيانات التواصل", "Contact details", "لم يتم إعداد بريد الدعم الرسمي بعد. ستُضاف بيانات التواصل الرسمية قبل الإطلاق.", "An official support email has not been configured yet. Official contact details will be added before launch."),
    ],
  },
} satisfies Record<string, Page>;

export type PageKey = keyof typeof PAGES;

export const FAQ: { q: L; a: L }[] = [
  { q: { ar: "هل العائد 1% شهرياً مضمون؟", en: "Is the 1% monthly return guaranteed?" }, a: { ar: "لا. 1% افتراض توضيحي في الحاسبة فقط. التوزيعات الفعلية تعتمد على صافي إيرادات التعدين المتحقَّق منها وقد تكون صفراً.", en: "No. 1% is only an illustrative calculator assumption. Actual distributions depend on verified net mining revenue and may be zero." } },
  { q: { ar: "ما الحد الأدنى للاستثمار؟", en: "What is the minimum investment?" }, a: { ar: "10 دولارات.", en: "$10." } },
  { q: { ar: "ما العملات المدعومة للإيداع؟", en: "Which assets can I deposit?" }, a: { ar: "البيتكوين وUSDT على الشبكات التي يفعّلها المسؤول ويتحقق منها فقط. لا تُرسل إلى شبكة غير ظاهرة في صفحة الإيداع.", en: "Bitcoin and USDT only on networks enabled and verified by the administrator. Never send on a network not shown on the deposit page." } },
  { q: { ar: "متى يُضاف الإيداع إلى رصيدي؟", en: "When is my deposit credited?" }, a: { ar: "فقط بعد التحقق من المعاملة على الشبكة (الأصل، الشبكة، العنوان، المبلغ، التأكيدات). إرسال معرّف المعاملة أو لقطة شاشة لا يكفي.", en: "Only after on-chain verification of asset, network, address, amount, and confirmations. Submitting a hash or screenshot is not enough." } },
  { q: { ar: "كيف تعمل الإحالة؟", en: "How do referrals work?" }, a: { ar: "تحصل على عمولة لمرة واحدة 1% على الإيداع المؤكَّد لمن أحلته مباشرة.", en: "You earn a one-time 1% commission on the confirmed deposit of a customer you referred directly." } },
  { q: { ar: "هل يمكن أن أخسر أموالي؟", en: "Can I lose money?" }, a: { ar: "نعم. راجع صفحة الإفصاح عن المخاطر.", en: "Yes. Please read the Risk Disclosure page." } },
];

export function authErrorMessage(err: unknown, lang: "ar" | "en"): string {
  const msg = (err as { message?: string })?.message?.toLowerCase() ?? "";
  const m = (ar: string, en: string) => (lang === "ar" ? ar : en);
  if (msg.includes("invalid login")) return m("البريد الإلكتروني أو كلمة المرور غير صحيحة.", "Incorrect email or password.");
  if (msg.includes("email not confirmed")) return m("لم يتم تأكيد بريدك بعد. تحقق من صندوق الوارد أو أعد إرسال رسالة التأكيد.", "Your email is not confirmed yet. Check your inbox or resend the confirmation.");
  if (msg.includes("already registered") || msg.includes("already exists")) return m("يوجد حساب مسجّل بهذا البريد. سجّل الدخول بدلاً من ذلك.", "An account with this email already exists. Please log in.");
  if (msg.includes("weak") || msg.includes("pwned") || msg.includes("password should")) return m("كلمة المرور ضعيفة أو مسرّبة سابقاً. اختر كلمة أقوى.", "Password is weak or previously leaked. Choose a stronger one.");
  if (msg.includes("expired") || msg.includes("invalid") && msg.includes("token")) return m("انتهت صلاحية الرابط. اطلب رابطاً جديداً.", "This link has expired. Please request a new one.");
  if (msg.includes("rate limit") || msg.includes("too many")) return m("محاولات كثيرة. يرجى الانتظار قليلاً ثم المحاولة مجدداً.", "Too many attempts. Please wait and try again.");
  if (msg.includes("fetch") || msg.includes("network")) return m("تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.", "Could not reach the server. Check your connection.");
  return m("حدث خطأ غير متوقع. حاول مرة أخرى.", "Something went wrong. Please try again.") + (msg ? ` (${msg})` : "");
}

export function passwordIssues(pw: string, lang: "ar" | "en"): string | null {
  const m = (ar: string, en: string) => (lang === "ar" ? ar : en);
  if (pw.length < 8) return m("8 أحرف على الأقل", "At least 8 characters");
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return m("يجب أن تحتوي على حروف وأرقام", "Must include letters and numbers");
  return null;
}

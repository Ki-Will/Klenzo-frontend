/**
 * Internationalization (i18n) configuration.
 * Supports multiple languages for global deployment.
 *
 * Usage:
 *   import { t } from '@/lib/i18n';
 *   const label = t('auth.login.button', currentLocale);
 */

export type Locale = "en" | "fr" | "es" | "de" | "pt" | "ar" | "zh" | "ja";

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALES: { code: Locale; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

/**
 * Translation keys organized by feature.
 */
const translations: Record<string, Record<Locale, string>> = {
  // Auth
  "auth.login.title": {
    en: "Secure Gateway to the Void",
    fr: "Passerelle Sécurisée vers le Vide",
    es: "Puerta de Seguridad al Vacío",
    de: "Sicherer Zugang zur Leere",
    pt: "Portal Seguro para o Vazio",
    ar: "بوابة آمنة إلى الفراغ",
    zh: "安全通往虚空之门",
    ja: "安全なゲートウェイ",
  },
  "auth.login.email": {
    en: "Email",
    fr: "Email",
    es: "Correo electrónico",
    de: "E-Mail",
    pt: "E-mail",
    ar: "البريد الإلكتروني",
    zh: "电子邮件",
    ja: "メールアドレス",
  },
  "auth.login.password": {
    en: "Password",
    fr: "Mot de passe",
    es: "Contraseña",
    de: "Passwort",
    pt: "Senha",
    ar: "كلمة المرور",
    zh: "密码",
    ja: "パスワード",
  },
  "auth.login.submit": {
    en: "ACCESS PORTAL",
    fr: "ACCÉDER AU PORTAIL",
    es: "ACCEDER AL PORTAL",
    de: "ZUGANG ZUM PORTAL",
    pt: "ACESSAR PORTAL",
    ar: "الدخول إلى البوابة",
    zh: "进入门户",
    ja: "ポータルにアクセス",
  },
  "auth.login.forgot": {
    en: "Forgot?",
    fr: "Oublié ?",
    es: "¿Olvidaste?",
    de: "Vergessen?",
    pt: "Esqueceu?",
    ar: "نسيت؟",
    zh: "忘记？",
    ja: "忘れた？",
  },
  "auth.login.noAccount": {
    en: "New to the void?",
    fr: "Nouveau dans le vide ?",
    es: "¿Nuevo en el vacío?",
    de: "Neu in der Leere?",
    pt: "Novo no vazio?",
    ar: "جديد في الفراغ؟",
    zh: "新用户？",
    ja: "初めての方？",
  },
  "auth.login.createAccount": {
    en: "Create Account",
    fr: "Créer un Compte",
    es: "Crear Cuenta",
    de: "Konto Erstellen",
    pt: "Criar Conta",
    ar: "إنشاء حساب",
    zh: "创建账户",
    ja: "アカウント作成",
  },

  // Dashboard
  "dashboard.welcome": {
    en: "Welcome back",
    fr: "Bienvenue",
    es: "Bienvenido",
    de: "Willkommen",
    pt: "Bem-vindo",
    ar: "مرحباً بعودتك",
    zh: "欢迎回来",
    ja: "おかえりなさい",
  },
  "dashboard.balance": {
    en: "Net Balance",
    fr: "Solde Net",
    es: "Saldo Neto",
    de: "Nettoguthaben",
    pt: "Saldo Líquido",
    ar: "الرصيد الصافي",
    zh: "净余额",
    ja: "純残高",
  },
  "dashboard.income": {
    en: "Income",
    fr: "Revenu",
    es: "Ingresos",
    de: "Einkommen",
    pt: "Receita",
    ar: "الدخل",
    zh: "收入",
    ja: "収入",
  },
  "dashboard.expenses": {
    en: "Spent",
    fr: "Dépensé",
    es: "Gastado",
    de: "Ausgegeben",
    pt: "Gasto",
    ar: "الإنفاق",
    zh: "支出",
    ja: "支出",
  },

  // Common
  "common.loading": {
    en: "Loading...",
    fr: "Chargement...",
    es: "Cargando...",
    de: "Laden...",
    pt: "Carregando...",
    ar: "جاري التحميل...",
    zh: "加载中...",
    ja: "読み込み中...",
  },
  "common.error": {
    en: "Something went wrong",
    fr: "Une erreur s'est produite",
    es: "Algo salió mal",
    de: "Etwas ist schiefgelaufen",
    pt: "Algo deu errado",
    ar: "حدث خطأ ما",
    zh: "出了点问题",
    ja: "問題が発生しました",
  },
  "common.retry": {
    en: "Try Again",
    fr: "Réessayer",
    es: "Intentar de nuevo",
    de: "Erneut versuchen",
    pt: "Tentar novamente",
    ar: "حاول مرة أخرى",
    zh: "重试",
    ja: "再試行",
  },
  "common.save": {
    en: "Save",
    fr: "Enregistrer",
    es: "Guardar",
    de: "Speichern",
    pt: "Salvar",
    ar: "حفظ",
    zh: "保存",
    ja: "保存",
  },
  "common.cancel": {
    en: "Cancel",
    fr: "Annuler",
    es: "Cancelar",
    de: "Abbrechen",
    pt: "Cancelar",
    ar: "إلغاء",
    zh: "取消",
    ja: "キャンセル",
  },
  "common.delete": {
    en: "Delete",
    fr: "Supprimer",
    es: "Eliminar",
    de: "Löschen",
    pt: "Excluir",
    ar: "حذف",
    zh: "删除",
    ja: "削除",
  },
};

/**
 * Get translation for a key.
 */
export function t(
  key: string,
  locale: Locale = DEFAULT_LOCALE,
  params?: Record<string, string | number>,
): string {
  const translation = translations[key]?.[locale] || translations[key]?.en || key;

  if (!params) return translation;

  return Object.entries(params).reduce(
    (result, [param, value]) => result.replace(`{${param}}`, String(value)),
    translation,
  );
}

/**
 * Get the user's preferred locale from browser.
 */
export function getBrowserLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const browserLang = navigator.language.split("-")[0];
  return LOCALES.find((l) => l.code === browserLang)?.code || DEFAULT_LOCALE;
}

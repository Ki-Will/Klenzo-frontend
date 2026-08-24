"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  articles,
  ARTICLE_LANGUAGES,
  type ArticleLang,
  type ArticleStatus,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  UILang,
  UI_LANGUAGES,
  t,
} from "@/lib/ui-translations";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SectionEntry {
  id: string;
  order: number;
  translations: Partial<
    Record<ArticleLang, { heading: string; content: string }>
  >;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let sectionCounter = 0;
function newSectionId() {
  return `sec_${Date.now()}_${++sectionCounter}`;
}

// ─── UI Language Selector ────────────────────────────────────────────────────

function UILangSelector({
  uiLang,
  onChange,
}: {
  uiLang: UILang;
  onChange: (lang: UILang) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {UI_LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => onChange(l.code)}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            uiLang === l.code
              ? "bg-primary-container text-on-primary-container"
              : "bg-card-high text-secondary-text hover:bg-card-highest"
          }`}
        >
          <span>{l.flag}</span>
          {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// ─── Translation Tabs ────────────────────────────────────────────────────────

function LangTabs({
  active,
  onChange,
  filled,
  uiLang,
}: {
  active: ArticleLang;
  onChange: (lang: ArticleLang) => void;
  filled: Set<ArticleLang>;
  uiLang: UILang;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
      {ARTICLE_LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => onChange(l.code)}
          className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
            active === l.code
              ? "bg-primary-container text-on-primary-container"
              : "bg-card-high text-secondary-text hover:bg-card-highest"
          }`}
        >
          {l.label}
          {filled.has(l.code) && active !== l.code && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Article Section Card ────────────────────────────────────────────────────

function SectionCard({
  section,
  onUpdate,
  onRemove,
  index,
  uiLang,
}: {
  section: SectionEntry;
  onUpdate: (updated: SectionEntry) => void;
  onRemove: () => void;
  index: number;
  uiLang: UILang;
}) {
  const [activeLang, setActiveLang] = useState<ArticleLang>("en");

  const current = section.translations[activeLang] || {
    heading: "",
    content: "",
  };

  const filledLangs = new Set<ArticleLang>(
    Object.keys(section.translations) as ArticleLang[],
  );

  const handleChange = (field: "heading" | "content", value: string) => {
    const translations = { ...section.translations };
    const existing = translations[activeLang] || { heading: "", content: "" };
    translations[activeLang] = { ...existing, [field]: value };
    onUpdate({ ...section, translations });
  };

  const copyFromEnglish = () => {
    const en = section.translations.en;
    if (en) {
      const translations = { ...section.translations };
      translations[activeLang] = { heading: en.heading, content: en.content };
      onUpdate({ ...section, translations });
    }
  };

  const hasEnglish = !!section.translations.en;
  const langLabel = ARTICLE_LANGUAGES.find((l) => l.code === activeLang)?.label || activeLang;

  return (
    <div className="bg-card rounded-2xl border border-[var(--c-border)] overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--c-border)]">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-extrabold text-primary">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-bold text-primary-text">
              {t(uiLang, "section")} {index + 1}
              {current.heading && (
                <span className="text-secondary-text font-normal ml-2">
                  — {current.heading.length > 30 ? current.heading.slice(0, 30) + "…" : current.heading}
                </span>
              )}
            </p>
            <p className="text-[10px] text-secondary-text">
              {filledLangs.size} / {ARTICLE_LANGUAGES.length} {t(uiLang, "languagesFilled")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-secondary-text hover:text-error hover:bg-error-container/10 rounded-full transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>

      {/* Language Tabs */}
      <div className="px-5 pt-4 flex items-center justify-between">
        <LangTabs active={activeLang} onChange={setActiveLang} filled={filledLangs} uiLang={uiLang} />
        {activeLang !== "en" && hasEnglish && !section.translations[activeLang] && (
          <button
            type="button"
            onClick={copyFromEnglish}
            className="ml-2 px-3 py-1.5 rounded-full text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">content_copy</span>
            {t(uiLang, "copyEn")}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4">
        {/* Section Heading */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">title</span>
            {t(uiLang, "sectionHeading")} ({langLabel})
          </label>
          <input
            type="text"
            value={current.heading}
            onChange={(e) => handleChange("heading", e.target.value)}
            placeholder={`${t(uiLang, "sectionHeadingPlaceholder")} ${langLabel}...`}
            className="w-full bg-card-deep border-none rounded-2xl py-3.5 px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Section Content */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">article</span>
            {t(uiLang, "sectionContent")} ({langLabel})
          </label>
          <textarea
            value={current.content}
            onChange={(e) => handleChange("content", e.target.value)}
            placeholder={`${t(uiLang, "sectionContentPlaceholder")} ${langLabel}...`}
            rows={4}
            className="w-full bg-card-deep border-none rounded-2xl py-3.5 px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function NewArticlePage() {
  const { user } = useAuth();
  const router = useRouter();

  // ── UI Language ──
  const [uiLang, setUiLang] = useState<UILang>("en");

  // ── Article-level translations (title, excerpt, body, SEO) ──
  const [activeLang, setActiveLang] = useState<ArticleLang>("en");
  const [translations, setTranslations] = useState<
    Partial<Record<ArticleLang, {
      title: string;
      excerpt: string;
      body: string;
      metaTitle: string;
      metaDescription: string;
      slug: string;
    }>>
  >({
    en: {
      title: "",
      excerpt: "",
      body: "",
      metaTitle: "",
      metaDescription: "",
      slug: "",
    },
  });

  // ── Article metadata ──
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("draft");

  // ── Sections ──
  const [sections, setSections] = useState<SectionEntry[]>([]);

  // ── UI state ──
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSections, setShowSections] = useState(true);

  // Current translation values
  const currentTranslation = translations[activeLang] || {
    title: "",
    excerpt: "",
    body: "",
    metaTitle: "",
    metaDescription: "",
    slug: "",
  };

  const filledLangs = new Set<ArticleLang>(
    Object.keys(translations) as ArticleLang[],
  );

  const langLabel = ARTICLE_LANGUAGES.find((l) => l.code === activeLang)?.label || activeLang;

  // ── Update a translation field ──
  type TranslationFields = "title" | "excerpt" | "body" | "metaTitle" | "metaDescription" | "slug";

  const updateTranslation = (
    field: TranslationFields,
    value: string,
  ) => {
    setTranslations((prev) => {
      const existing = prev[activeLang] || {
        title: "",
        excerpt: "",
        body: "",
        metaTitle: "",
        metaDescription: "",
        slug: "",
      };
      return {
        ...prev,
        [activeLang]: { ...existing, [field]: value } as (typeof prev)[ArticleLang],
      };
    });
  };

  // ── Add a language translation (copy from English if available) ──
  const addTranslation = (lang: ArticleLang) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: prev[lang] || {
        title: "",
        excerpt: "",
        body: "",
        metaTitle: "",
        metaDescription: "",
        slug: "",
      },
    }));
    setActiveLang(lang);
  };

  // ── Sections management ──
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: newSectionId(),
        order: prev.length,
        translations: {
          en: { heading: "", content: "" },
        },
      },
    ]);
  };

  const updateSection = (index: number, updated: SectionEntry) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const enTitle = translations.en?.title?.trim();
    if (!enTitle) {
      setError(t(uiLang, "englishTitleRequired"));
      setSubmitting(false);
      return;
    }

    try {
      const translationPayload = Object.entries(translations).map(
        ([lang, t]) => ({
          lang: lang as ArticleLang,
          title: t?.title || undefined,
          excerpt: t?.excerpt || undefined,
          body: t?.body || undefined,
          metaTitle: t?.metaTitle || undefined,
          metaDescription: t?.metaDescription || undefined,
          slug: t?.slug || undefined,
        }),
      );

      const sectionPayload = sections.map((s, i) => ({
        order: i,
        translations: s.translations,
      }));

      await articles.create({
        slug: translations.en?.slug || enTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        featuredImage: featuredImage || undefined,
        category: category || undefined,
        tags: tags
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        status,
        translations: translationPayload,
        sections: sectionPayload,
      });

      router.push("/admin/articles");
    } catch (err: any) {
      setError(err?.message || t(uiLang, "failedToCreate"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-secondary-text hover:text-primary-text text-xs font-bold mb-3 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>
              {t(uiLang, "backToArticles")}
            </button>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-primary-text">
              {t(uiLang, "newArticle")}
            </h1>
            <p className="text-sm text-secondary-text mt-1">
              {t(uiLang, "newArticleDesc")}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <UILangSelector uiLang={uiLang} onChange={setUiLang} />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  status === "draft"
                    ? "bg-card-high border-primary/30 text-primary"
                    : "border-[var(--c-border)] text-secondary-text hover:bg-card-high"
                }`}
              >
                {t(uiLang, "draft")}
              </button>
              <button
                type="button"
                onClick={() => setStatus("published")}
                className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  status === "published"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "border-[var(--c-border)] text-secondary-text hover:bg-card-high"
                }`}
              >
                {t(uiLang, "published")}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Language Tabs ────────────────────────────────────────── */}
          <div className="bg-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">
                  translate
                </span>
                <h2 className="text-sm font-bold text-primary-text">
                  {t(uiLang, "articleTranslations")}
                </h2>
              </div>
              <span className="text-[10px] text-secondary-text">
                {filledLangs.size} / {ARTICLE_LANGUAGES.length} {t(uiLang, "languagesFilled")}
              </span>
            </div>
            <LangTabs
              active={activeLang}
              onChange={(lang) => {
                if (!translations[lang]) addTranslation(lang);
                else setActiveLang(lang);
              }}
              filled={filledLangs}
              uiLang={uiLang}
            />
          </div>

          {/* ── Title ───────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">title</span>
              {t(uiLang, "titleRequired")}
              <span className="text-primary text-[10px] normal-case tracking-normal">
                ({langLabel})
              </span>
            </label>
            <input
              type="text"
              value={currentTranslation.title}
              onChange={(e) => updateTranslation("title", e.target.value)}
              placeholder={`${t(uiLang, "articleTitlePlaceholder")} ${langLabel}...`}
              required={activeLang === "en"}
              className="w-full bg-card-deep border-none rounded-2xl py-4 px-5 text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-base font-semibold"
            />
          </div>

          {/* ── Excerpt ─────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">
                short_text
              </span>
              {t(uiLang, "excerpt")}
              <span className="text-primary text-[10px] normal-case tracking-normal">
                ({langLabel})
              </span>
            </label>
            <textarea
              value={currentTranslation.excerpt}
              onChange={(e) => updateTranslation("excerpt", e.target.value)}
              placeholder={`${t(uiLang, "shortSummaryPlaceholder")} ${langLabel}...`}
              rows={2}
              className="w-full bg-card-deep border-none rounded-2xl py-3.5 px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          {/* ── Body ────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">
                article
              </span>
              {t(uiLang, "body")}
              <span className="text-primary text-[10px] normal-case tracking-normal">
                ({langLabel})
              </span>
            </label>
            <textarea
              value={currentTranslation.body}
              onChange={(e) => updateTranslation("body", e.target.value)}
              placeholder={`${t(uiLang, "writeBodyPlaceholder")} ${langLabel}...`}
              rows={8}
              className="w-full bg-card-deep border-none rounded-2xl py-4 px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none leading-relaxed"
            />
          </div>

          {/* ── Slug ────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-secondary-text uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">link</span>
              {t(uiLang, "slug")}
              <span className="text-primary text-[10px] normal-case tracking-normal">
                ({langLabel})
              </span>
            </label>
            <input
              type="text"
              value={currentTranslation.slug}
              onChange={(e) => updateTranslation("slug", e.target.value)}
              placeholder={`${t(uiLang, "slugPlaceholder")}-${activeLang}`}
              className="w-full bg-card-deep border-none rounded-2xl py-3.5 px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
            />
          </div>

          {/* ── SEO Fields ──────────────────────────────────────────── */}
          <div className="bg-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">
                search
              </span>
              <h3 className="text-sm font-bold text-primary-text">
                {t(uiLang, "seoSection")} — {langLabel}
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
                {t(uiLang, "metaTitle")}
              </label>
              <input
                type="text"
                value={currentTranslation.metaTitle}
                onChange={(e) => updateTranslation("metaTitle", e.target.value)}
                placeholder={t(uiLang, "metaTitlePlaceholder")}
                className="w-full bg-card-deep border-none rounded-2xl py-3.5 px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              <p className="text-[10px] text-secondary-text">
                {(currentTranslation.metaTitle || "").length} / 60 {t(uiLang, "characters")}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
                {t(uiLang, "metaDescription")}
              </label>
              <textarea
                value={currentTranslation.metaDescription}
                onChange={(e) =>
                  updateTranslation("metaDescription", e.target.value)
                }
                placeholder={t(uiLang, "metaDescriptionPlaceholder")}
                rows={2}
                className="w-full bg-card-deep border-none rounded-2xl py-3.5 px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              />
              <p className="text-[10px] text-secondary-text">
                {(currentTranslation.metaDescription || "").length} / 160{" "}
                {t(uiLang, "characters")}
              </p>
            </div>
          </div>

          {/* ── Metadata (not translated) ───────────────────────────── */}
          <div className="bg-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">
                tune
              </span>
              <h3 className="text-sm font-bold text-primary-text">
                {t(uiLang, "articleSettings")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
                  {t(uiLang, "category")}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-card-deep border-none rounded-2xl py-3.5 px-5 text-sm text-primary-text focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="">{t(uiLang, "selectCategory")}</option>
                  <option value="news">{t(uiLang, "catNews")}</option>
                  <option value="guide">{t(uiLang, "catGuide")}</option>
                  <option value="tutorial">{t(uiLang, "catTutorial")}</option>
                  <option value="announcement">{t(uiLang, "catAnnouncement")}</option>
                  <option value="update">{t(uiLang, "catUpdate")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
                  {t(uiLang, "tags")}
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder={t(uiLang, "tagsPlaceholder")}
                  className="w-full bg-card-deep border-none rounded-2xl py-3.5 px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-secondary-text uppercase tracking-widest block">
                {t(uiLang, "featuredImage")}
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder={t(uiLang, "featuredImagePlaceholder")}
                className="w-full bg-card-deep border-none rounded-2xl py-3.5 px-5 text-sm text-primary-text placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
              />
              {featuredImage && (
                <div className="mt-2 rounded-xl overflow-hidden border border-[var(--c-border)]">
                  <img
                    src={featuredImage}
                    alt={t(uiLang, "featuredImagePreview")}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Article Sections with Translations ───────────────────── */}
          <div className="space-y-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowSections(!showSections)}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">
                  view_agenda
                </span>
                <h2 className="text-sm font-bold text-primary-text">
                  {t(uiLang, "articleSections")}
                </h2>
                {sections.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {sections.length}
                  </span>
                )}
              </div>
              <span className="material-symbols-outlined text-secondary-text text-lg transition-transform">
                {showSections ? "expand_less" : "expand_more"}
              </span>
            </div>

            {showSections && (
              <div className="space-y-4">
                {sections.map((section, i) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    index={i}
                    onUpdate={(updated) => updateSection(i, updated)}
                    onRemove={() => removeSection(i)}
                    uiLang={uiLang}
                  />
                ))}

                <button
                  type="button"
                  onClick={addSection}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-[var(--c-border)] text-secondary-text hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  {t(uiLang, "addSection")}
                  <span className="text-[10px] text-muted font-normal">
                    {t(uiLang, "withTranslations")}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* ── Error ───────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-error-container/10 rounded-2xl">
              <span className="material-symbols-outlined text-error text-lg">
                error
              </span>
              <p className="text-error text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* ── Footer Actions ──────────────────────────────────────── */}
          <div className="sticky bottom-0 bg-surface/80 backdrop-blur-xl border-t border-[var(--c-border)] -mx-6 lg:-mx-12 px-6 lg:px-12 py-4">
            <div className="max-w-4xl mx-auto flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-4 rounded-full bg-card-high text-secondary-text hover:text-primary-text font-headline font-bold text-sm hover:bg-card-highest transition-all cursor-pointer text-center"
              >
                {t(uiLang, "cancel")}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 luminous-gradient text-white font-headline font-bold text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-sm">
                      progress_activity
                    </span>
                    {t(uiLang, "publishing")}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">
                      publish
                    </span>
                    {status === "published"
                      ? t(uiLang, "publishArticle")
                      : t(uiLang, "saveDraft")}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

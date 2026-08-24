/**
 * UI Translations for the admin article creation page.
 * Supports English (en), French (fr), and Kinyarwanda (rw).
 */

export type UILang = "en" | "fr" | "rw";

export const UI_LANGUAGES: { code: UILang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "rw", label: "Kinyarwanda", flag: "🇷🇼" },
];

type TranslationKeys = {
  // Page header
  newArticle: string;
  newArticleDesc: string;
  backToArticles: string;

  // Status
  draft: string;
  published: string;

  // Language tabs
  articleTranslations: string;
  languagesFilled: string;

  // Fields
  title: string;
  titleRequired: string;
  excerpt: string;
  body: string;
  slug: string;
  slugPlaceholder: string;

  // SEO
  seoSection: string;
  metaTitle: string;
  metaTitlePlaceholder: string;
  metaDescription: string;
  metaDescriptionPlaceholder: string;
  characters: string;

  // Article settings
  articleSettings: string;
  category: string;
  selectCategory: string;
  tags: string;
  tagsPlaceholder: string;
  featuredImage: string;
  featuredImagePlaceholder: string;
  featuredImagePreview: string;

  // Category options
  catNews: string;
  catGuide: string;
  catTutorial: string;
  catAnnouncement: string;
  catUpdate: string;

  // Sections
  articleSections: string;
  section: string;
  sectionHeading: string;
  sectionContent: string;
  addSection: string;
  withTranslations: string;
  copyEn: string;

  // Placeholders
  articleTitlePlaceholder: string;
  shortSummaryPlaceholder: string;
  writeBodyPlaceholder: string;
  sectionHeadingPlaceholder: string;
  sectionContentPlaceholder: string;

  // Buttons
  cancel: string;
  saveDraft: string;
  publishArticle: string;
  publishing: string;

  // Errors
  englishTitleRequired: string;
  failedToCreate: string;
};

const translations: Record<UILang, TranslationKeys> = {
  en: {
    newArticle: "New Article",
    newArticleDesc: "Create content with multi-language translations for each section",
    backToArticles: "Back to Articles",
    draft: "Draft",
    published: "Published",
    articleTranslations: "Article Translations",
    languagesFilled: "languages",
    title: "Title",
    titleRequired: "Title *",
    excerpt: "Excerpt",
    body: "Body",
    slug: "Slug",
    slugPlaceholder: "url-slug",
    seoSection: "SEO",
    metaTitle: "Meta Title",
    metaTitlePlaceholder: "SEO title for search engines...",
    metaDescription: "Meta Description",
    metaDescriptionPlaceholder: "SEO description for search engines...",
    characters: "characters",
    articleSettings: "Article Settings",
    category: "Category",
    selectCategory: "Select category",
    tags: "Tags",
    tagsPlaceholder: "finance, tips, budget (comma separated)",
    featuredImage: "Featured Image URL",
    featuredImagePlaceholder: "https://example.com/image.jpg",
    featuredImagePreview: "Featured preview",
    catNews: "News",
    catGuide: "Guide",
    catTutorial: "Tutorial",
    catAnnouncement: "Announcement",
    catUpdate: "Product Update",
    articleSections: "Article Sections",
    section: "Section",
    sectionHeading: "Section Heading",
    sectionContent: "Section Content",
    addSection: "Add Section",
    withTranslations: "(with translations)",
    copyEn: "Copy EN",
    articleTitlePlaceholder: "Article title in",
    shortSummaryPlaceholder: "Short summary in",
    writeBodyPlaceholder: "Write article body in",
    sectionHeadingPlaceholder: "Section heading in",
    sectionContentPlaceholder: "Write section content in",
    cancel: "Cancel",
    saveDraft: "Save Draft",
    publishArticle: "Publish Article",
    publishing: "Publishing…",
    englishTitleRequired: "English title is required",
    failedToCreate: "Failed to create article",
  },
  fr: {
    newArticle: "Nouvel Article",
    newArticleDesc: "Créez du contenu avec des traductions multilingues pour chaque section",
    backToArticles: "Retour aux Articles",
    draft: "Brouillon",
    published: "Publié",
    articleTranslations: "Traductions de l'Article",
    languagesFilled: "langues",
    title: "Titre",
    titleRequired: "Titre *",
    excerpt: "Extrait",
    body: "Corps",
    slug: "Slug",
    slugPlaceholder: "slug-url",
    seoSection: "SEO",
    metaTitle: "Titre Meta",
    metaTitlePlaceholder: "Titre SEO pour les moteurs de recherche...",
    metaDescription: "Description Meta",
    metaDescriptionPlaceholder: "Description SEO pour les moteurs de recherche...",
    characters: "caractères",
    articleSettings: "Paramètres de l'Article",
    category: "Catégorie",
    selectCategory: "Sélectionner une catégorie",
    tags: "Tags",
    tagsPlaceholder: "finance, conseils, budget (séparés par des virgules)",
    featuredImage: "URL de l'Image à la Une",
    featuredImagePlaceholder: "https://exemple.com/image.jpg",
    featuredImagePreview: "Aperçu",
    catNews: "Actualités",
    catGuide: "Guide",
    catTutorial: "Tutoriel",
    catAnnouncement: "Annonce",
    catUpdate: "Mise à Jour Produit",
    articleSections: "Sections de l'Article",
    section: "Section",
    sectionHeading: "Titre de la Section",
    sectionContent: "Contenu de la Section",
    addSection: "Ajouter une Section",
    withTranslations: "(avec traductions)",
    copyEn: "Copier EN",
    articleTitlePlaceholder: "Titre de l'article en",
    shortSummaryPlaceholder: "Résumé en",
    writeBodyPlaceholder: "Écrire le corps en",
    sectionHeadingPlaceholder: "Titre de la section en",
    sectionContentPlaceholder: "Écrire le contenu en",
    cancel: "Annuler",
    saveDraft: "Enregistrer Brouillon",
    publishArticle: "Publier l'Article",
    publishing: "Publication…",
    englishTitleRequired: "Le titre en anglais est requis",
    failedToCreate: "Échec de la création de l'article",
  },
  rw: {
    newArticle: "Inkuru Nshya",
    newArticleDesc: "Hanga ibikubiyemo hamwe n'ubusobanurize bw'amahuriro menshi ku bice byose",
    backToArticles: "Subira ku Nkuru",
    draft: "Rangarura",
    published: "Yashyizwe public",
    articleTranslations: "Ivuga ry'Inkuru",
    languagesFilled: "indimi",
    title: "Izina",
    titleRequired: "Izina *",
    excerpt: "Ibikubiyemo",
    body: "Umubiri",
    slug: "Slug",
    slugPlaceholder: "slug-url",
    seoSection: "SEO",
    metaTitle: "Izina rya Meta",
    metaTitlePlaceholder: "Izina rya SEO kuri moto z'ubushakashatsi...",
    metaDescription: "Ibisobanuro bya Meta",
    metaDescriptionPlaceholder: "Ibisobanuro bya SEO kuri moto z'ubushakashatsi...",
    characters: "inyandiko",
    articleSettings: "Amategeko y'Inkuru",
    category: "Urwego",
    selectCategory: "Hitamo urwego",
    tags: "Amatagi",
    tagsPlaceholder: "ubushobozi, amabwiriza, igiciro (hatandikanye comma)",
    featuredImage: "URL y'Ishusho",
    featuredImagePlaceholder: "https://urugero.com/ishusho.jpg",
    featuredImagePreview: "Ishusho ryerekeranywe",
    catNews: "Amakuru",
    catGuide: "Ubuyobozi",
    catTutorial: "Amasomo",
    catAnnouncement: "Ikinyamakuru",
    catUpdate: "Kuvugurura Igiciro",
    articleSections: "Ibice by'Inkuru",
    section: "Igice",
    sectionHeading: "Ishoko ry'Igice",
    sectionContent: "Ibikubiyemo by'Igice",
    addSection: "Ongeraho Igice",
    withTranslations: "(hamwe n'ivuga)",
    copyEn: "Koporora EN",
    articleTitlePlaceholder: "Izina ry'inkuru mu",
    shortSummaryPlaceholder: "Ibikubiyemo bisobanutse mu",
    writeBodyPlaceholder: "Andika umubiri mu",
    sectionHeadingPlaceholder: "Ishoko ry'igice mu",
    sectionContentPlaceholder: "Andika ibikubiyemo by'igice mu",
    cancel: "Hagarika",
    saveDraft: "Bika Rangarura",
    publishArticle: "Shyira Inkuru Public",
    publishing: "Kurangura…",
    englishTitleRequired: "Izina mu buryo bwinjishi birakenewe",
    failedToCreate: "Kwinjira kw'inkuru byanze",
  },
};

export function t(lang: UILang, key: keyof TranslationKeys): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

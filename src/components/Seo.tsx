import { useEffect } from "react";

interface SeoProps {
  title: string;
  description: string;
  noindex?: boolean;
}

function upsertMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let meta = document.head.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(property ? "property" : "name", name);
    document.head.append(meta);
  }
  meta.content = content;
}

export function Seo({ title, description, noindex = false }: SeoProps) {
  useEffect(() => {
    const canonicalUrl = `${import.meta.env.VITE_APP_SITE_URL ?? window.location.origin}${window.location.pathname}`;
    document.title = title;
    upsertMeta("description", description);
    upsertMeta("robots", noindex ? "noindex,nofollow" : "index,follow");
    upsertMeta("og:title", title, true);
    upsertMeta("og:description", description, true);
    upsertMeta("og:type", "website", true);
    upsertMeta("og:url", canonicalUrl, true);
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, noindex, title]);

  return null;
}

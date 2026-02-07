import React, { useEffect } from 'react';
import seoConfig from '../../seo/config';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

function setMetaTag(selector: string, attrName: 'name' | 'property', attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

const Seo: React.FC<SeoProps> = ({ title, description, image, url, type = 'website', noindex = false }) => {
  useEffect(() => {
    const pageTitle = title ? `${title} | ${seoConfig.siteName}` : seoConfig.defaultTitle;
    document.title = pageTitle;

    const desc = description || seoConfig.defaultDescription;
    setMetaTag('meta', 'name', 'description', desc);
    setMetaTag('meta', 'name', 'viewport', 'width=device-width, initial-scale=1');

    // Open Graph
    setMetaTag('meta', 'property', 'og:title', pageTitle);
    setMetaTag('meta', 'property', 'og:description', desc);
    setMetaTag('meta', 'property', 'og:type', type);
    setMetaTag('meta', 'property', 'og:image', image || seoConfig.defaultImage);
    setMetaTag('meta', 'property', 'og:url', url || seoConfig.siteUrl + window.location.pathname);

    // Twitter
    setMetaTag('meta', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta', 'name', 'twitter:site', seoConfig.twitterHandle);
    setMetaTag('meta', 'name', 'twitter:title', pageTitle);
    setMetaTag('meta', 'name', 'twitter:description', desc);
    setMetaTag('meta', 'name', 'twitter:image', image || seoConfig.defaultImage);

    // canonical
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.href = url || seoConfig.siteUrl + window.location.pathname;

    // noindex
    let robots = document.querySelector("meta[name='robots']") as HTMLMetaElement | null;
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.content = noindex ? 'noindex, nofollow' : 'index, follow';

    // JSON-LD Organization
    const ldId = 'seo-org-jsonld';
    let ld = document.getElementById(ldId) as HTMLScriptElement | null;
    if (!ld) {
      ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.id = ldId;
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
      logo: seoConfig.defaultImage,
    });

    // cleanup not needed — tags should persist while user navigates SPA
  }, [title, description, image, url, type, noindex]);

  return null;
};

export default Seo;

#!/usr/bin/env node
// Simple sitemap generator - fetches properties, projects and blogs from API and writes public/sitemap.xml
const fs = require('fs');
const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://lotliterealestate.com').replace(/\/$/, '');
const apiBase = (process.env.SITE_API_URL || process.env.VITE_API_BASE_URL || 'https://api.lotliterealestate.com').replace(/\/$/, '');

async function fetchJson(path) {
  try {
    const res = await fetch(`${apiBase}${path}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('fetch error', path, e.message || e);
    return [];
  }
}

(async () => {
  try {
    const urls = new Set();
    // Static pages
    ['/','/projects','/properties','/blogs','/search'].forEach(p => urls.add(`${siteUrl}${p}`));

    // Dynamic: properties
    const properties = await fetchJson('/api/properties');
    if (Array.isArray(properties)) {
      properties.forEach(p => {
        if (p && p.id) urls.add(`${siteUrl}/properties/${p.id}`);
      });
    }

    // projects
    const projects = await fetchJson('/api/projects');
    if (Array.isArray(projects)) {
      projects.forEach(p => {
        if (p && p.id) urls.add(`${siteUrl}/projects/${p.id}`);
      });
    }

    // blogs (attempt API; fallback to none)
    try {
      const blogs = await fetchJson('/api/blogs');
      if (Array.isArray(blogs)) {
        blogs.forEach(b => { if (b && b.id) urls.add(`${siteUrl}/blogs/${b.id}`); });
      }
    } catch (_) {}

    const now = new Date().toISOString();
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`).join('\n')}\n</urlset>`;

    const outDir = 'public';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(`${outDir}/sitemap.xml`, sitemap, 'utf8');
    console.log(`Wrote ${outDir}/sitemap.xml with ${urls.size} URLs`);
  } catch (e) {
    console.error('sitemap generation failed', e);
    process.exit(1);
  }
})();

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://lotliterealestate.com').replace(/\/$/, '');

export const seoConfig = {
  siteName: 'Lotlite',
  defaultTitle: 'Lotlite - Find Your Dream',
  defaultDescription: 'Find apartments, villas, offices and projects across India. Lotlite connects buyers, renters and developers with trusted listings and agents.',
  siteUrl: SITE_URL,
  defaultImage: `${SITE_URL}/src/assets/og-default.png`,
  twitterHandle: '@lotlitereal',
};

export default seoConfig;

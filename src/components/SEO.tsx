import { Helmet } from 'react-helmet-async';
import { seoConfig } from '../config/seo';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export default function SEO({
  title,
  description = seoConfig.defaultDescription,
  image = seoConfig.defaultOGImage,
  url,
  type = 'website',
  noindex = false,
  nofollow = false,
  canonical,
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
}: SEOProps) {
  // Generate full title with template
  const fullTitle = title
    ? seoConfig.titleTemplate.replace('%s', title)
    : seoConfig.defaultTitle;

  // Generate full URLs
  const fullUrl = url
    ? `${seoConfig.baseUrl}${url.startsWith('/') ? url : `/${url}`}`
    : seoConfig.baseUrl;

  const fullImageUrl = image.startsWith('http')
    ? image
    : `${seoConfig.baseUrl}${image.startsWith('/') ? image : `/${image}`}`;

  const canonicalUrl = canonical
    ? `${seoConfig.baseUrl}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
    : fullUrl;

  // Generate robots meta content
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Keywords */}
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      {/* Author */}
      {author && <meta name="author" content={author} />}

      {/* Open Graph Tags */}
      <meta property="og:site_name" content={seoConfig.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={seoConfig.locale} />

      {/* Article-specific OG tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      {seoConfig.twitterHandle && (
        <meta name="twitter:site" content={seoConfig.twitterHandle} />
      )}

      {/* Additional Meta Tags */}
      <meta name="application-name" content={seoConfig.siteName} />
      <meta name="apple-mobile-web-app-title" content={seoConfig.siteName} />
    </Helmet>
  );
}

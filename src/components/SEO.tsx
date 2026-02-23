import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  name?: string;
  image?: string;
  canonical?: string;
}

export default function SEO({ 
  title, 
  description = 'Connecting Kenyan diaspora and study-abroad returnees with local projects, ventures, and consultancy roles to drive economic growth.', 
  type = 'website', 
  name = 'Strategic Pathways',
  image = '/logo-og.png',
  canonical = 'https://www.joinstrategicpathways.com/'
}: SEOProps) {
  const pageTitle = title ? `${title} | ${name}` : name;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{pageTitle}</title>
      <meta name='description' content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* OpenGraph tags for LinkedIn/Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}

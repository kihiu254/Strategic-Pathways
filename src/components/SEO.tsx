import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  name?: string;
}

export default function SEO({ 
  title, 
  description = 'Mobilising study-abroad returnees and diaspora professionals into collaborative projects, consultancy engagements, and venture-building initiatives that strengthen local economies in Kenya.', 
  type = 'website', 
  name = 'Strategic Pathways' 
}: SEOProps) {
  const pageTitle = title ? `${title} | ${name}` : name;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{pageTitle}</title>
      <meta name='description' content={description} />
      
      {/* OpenGraph tags for LinkedIn/Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}

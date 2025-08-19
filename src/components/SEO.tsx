import React from 'react';
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: string;
  currency?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
}

export default function SEO({ 
  title, 
  description, 
  image, 
  url,
  type = 'website',
  price,
  currency = 'USD',
  availability = 'in_stock'
}: SEOProps) {
  const fullTitle = title.includes('Golden Graze') ? title : `${title} | Golden Graze`;
  const fullUrl = url ? `${window.location.origin}${url}` : window.location.href;
  const fullImage = image?.startsWith('http') ? image : `${window.location.origin}${image || '/product_images/golden_graze1.png'}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Golden Graze" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={fullImage} />

      {/* Product-specific meta tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
          <meta name="robots" content="index, follow" />
        </>
      )}

      {/* Schema.org structured data for products */}
      {type === 'product' && price && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": title,
            "description": description,
            "image": fullImage,
            "url": fullUrl,
            "brand": {
              "@type": "Brand",
              "name": "Golden Graze"
            },
            "offers": {
              "@type": "Offer",
              "price": price,
              "priceCurrency": currency,
              "availability": `https://schema.org/${availability === 'in_stock' ? 'InStock' : 'OutOfStock'}`,
              "url": fullUrl
            }
          })}
        </script>
      )}
    </Helmet>
  );
}
import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  price?: number;
  currency?: string;
  availability?: 'instock' | 'oos' | 'discontinued';
  jsonLd?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Gild',
  description = 'Buy and sell unique items on Gild',
  image = '/logogild.png',
  url,
  type = 'website',
  price,
  currency = 'USD',
  availability = 'instock',
  jsonLd
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attributeName = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attributeName}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    if (url) updateMetaTag('og:url', url, true);
    updateMetaTag('og:image', image.startsWith('http') ? image : `https://thegild.app${image}`, true);
    
    // Product specific Open Graph tags
    if (type === 'product' && price) {
      updateMetaTag('og:price:amount', price.toString(), true);
      updateMetaTag('og:price:currency', currency, true);
      updateMetaTag('og:availability', availability, true);
    }
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image.startsWith('http') ? image : `https://thegild.app${image}`, true);
    
    // Add JSON-LD structured data
    if (jsonLd) {
      let scriptElement = document.querySelector('script[type="application/ld+json"]');
      
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptElement);
      }
      
      scriptElement.textContent = JSON.stringify(jsonLd);
    }
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Gild';
    };
  }, [title, description, image, url, type, price, currency, availability, jsonLd]);

  return null;
};

export default SEOHead;
import React, { useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalPath?: string;
  type?: 'website' | 'article' | 'profile';
  doctorSchema?: {
    name: string;
    specialty: string;
    qualifications: string[];
    bio: string;
    image: string;
  };
  serviceSchema?: {
    name: string;
    description: string;
    department: string;
    price?: number;
  };
  faqSchema?: {
    items: { question: string; answer: string }[];
  };
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  ogImage,
  canonicalPath = '',
  type = 'website',
  doctorSchema,
  serviceSchema,
  faqSchema,
}) => {
  const { settings } = useClinic();

  const siteName = settings.clinicName || 'Om Sai Adarsha Clinic';
  const defaultTitle = `${siteName} — Comprehensive Healthcare & Diagnostics`;
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const metaDescription =
    description ||
    settings.metaDescription ||
    'Professional outpatient medical clinic providing specialist doctor consultations, accurate pathology diagnostics, preventive health checkups, and 24/7 emergency response.';
  const shareImage = ogImage || settings.defaultOgImage || settings.mainLogoUrl || '/og-image.jpg';
  const baseUrl = (settings.productionUrl || 'https://om-sai-adarsha.clinic').replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  useEffect(() => {
    // 1. Update Title Tag
    document.title = fullTitle;

    // 2. Helper to set or create meta tag
    const setMetaTag = (attribute: string, name: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', metaDescription);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDescription);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', siteName);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', shareImage);

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', metaDescription);
    setMetaTag('name', 'twitter:image', shareImage);

    // Robots directive for public indexable pages
    setMetaTag('name', 'robots', 'index, follow');

    // Google Search Console verification token if configured
    if (settings.searchConsoleVerification) {
      setMetaTag('name', 'google-site-verification', settings.searchConsoleVerification);
    }

    // 3. Update Canonical Link Tag
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. Inject Schema.org JSON-LD Structured Data
    const structuredDataArray: any[] = [];

    // Core MedicalClinic Schema
    const clinicSchema = {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      name: siteName,
      alternateName: 'Om Sai Clinic',
      url: baseUrl,
      logo: settings.mainLogoUrl || `${baseUrl}/logo.png`,
      image: shareImage,
      telephone: settings.emergencyPhone || settings.generalPhone || '+91-80-2838-5555',
      email: settings.email || 'care@om-sai-adarsha.clinic',
      priceRange: '₹₹',
      medicalSpecialty: [
        'General Medicine',
        'Pediatrics',
        'Cardiology',
        'Orthopedics',
        'Gynecology & Obstetrics',
        'Dermatology',
        'Pathology & Diagnostic Laboratory',
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings.address?.street || '#42, 1st Cross, Vidyaranyapura Main Road',
        addressLocality: settings.address?.city || 'Bengaluru',
        addressRegion: settings.address?.state || 'Karnataka',
        postalCode: settings.address?.postalCode || '560097',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: settings.coordinates?.lat || 13.0827,
        longitude: settings.coordinates?.lng || 77.5615,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '21:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday'],
          opens: '08:00',
          closes: '20:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday'],
          opens: '09:00',
          closes: '13:00',
        },
      ],
    };
    structuredDataArray.push(clinicSchema);

    // Optional Physician Schema (for doctor detail page)
    if (doctorSchema) {
      structuredDataArray.push({
        '@context': 'https://schema.org',
        '@type': 'Physician',
        name: doctorSchema.name,
        medicalSpecialty: doctorSchema.specialty,
        description: doctorSchema.bio,
        image: doctorSchema.image,
        worksFor: {
          '@type': 'MedicalClinic',
          name: siteName,
        },
      });
    }

    // Optional MedicalWebPage Schema (for service detail page)
    if (serviceSchema) {
      structuredDataArray.push({
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: serviceSchema.name,
        description: serviceSchema.description,
        about: {
          '@type': 'MedicalProcedure',
          name: serviceSchema.name,
        },
      });
    }

    // Optional FAQPage Schema (for FAQ page)
    if (faqSchema && faqSchema.items.length > 0) {
      structuredDataArray.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqSchema.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }

    let scriptTag = document.getElementById('clinic-json-ld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'clinic-json-ld';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredDataArray, null, 2);
  }, [
    fullTitle,
    metaDescription,
    shareImage,
    canonicalUrl,
    type,
    settings,
    doctorSchema,
    serviceSchema,
    faqSchema,
  ]);

  return null;
};

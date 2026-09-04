import { LensProvider } from '@/components/LensContext';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { AdinkraCloth } from '@/components/AdinkraCloth';
import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { DualProfile } from '@/components/DualProfile';
import { TaglineReveal } from '@/components/TaglineReveal';
import { Kingdom } from '@/components/Kingdom';
import { Vision } from '@/components/Vision';
import { Projects } from '@/components/Projects';
import { Adinkra } from '@/components/Adinkra';
import { FilmFeature } from '@/components/FilmFeature';
import { Media } from '@/components/Media';
import { Faq } from '@/components/Faq';
import { Engage } from '@/components/Engage';
import { Footer } from '@/components/Footer';
import { FAQ, CHIEF, COMPANY } from '@/lib/content';

/* AEO: FAQ and person structured data */
function StructuredData() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        name: CHIEF.fullName,
        jobTitle: `${CHIEF.title}, ${CHIEF.titleMeaning}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: CHIEF.place,
          addressRegion: CHIEF.region,
          addressCountry: 'GH',
        },
        worksFor: {
          '@type': 'Organization',
          name: COMPANY.name,
          description: COMPANY.promise,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export default function Home() {
  return (
    <LensProvider>
      <StructuredData />
      <MotionProvider />
      {/* The cloth the whole page is printed on */}
      <AdinkraCloth />
      <Nav />
      <main id="main" className="relative z-10">
        <Hero />
        <DualProfile />
        <TaglineReveal />
        <Kingdom />
        <Vision />
        <Projects />
        <Adinkra />
        <FilmFeature />
        <Media />
        <Faq />
        <Engage />
      </main>
      <Footer />
    </LensProvider>
  );
}

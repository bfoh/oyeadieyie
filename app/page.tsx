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
import { Updates } from '@/components/Updates';
import { Faq } from '@/components/Faq';
import { Engage } from '@/components/Engage';
import { Footer } from '@/components/Footer';
import { Events } from '@/components/Events';
import { FAQ, CHIEF, COMPANY } from '@/lib/content';
import { SITE } from '@/lib/site';
import { readContent } from '@/lib/store';
import { ContactProvider } from '@/components/ContactContext';

/**
 * Structured data.
 *
 * Written as a graph of linked entities rather than one nested blob, so the
 * chief, his company and the site are three things a search engine can hold
 * separately and connect. `sameAs` is what builds a knowledge panel; fill it
 * as soon as the office confirms its official accounts.
 */
function StructuredData() {
  const person = `${SITE}/#chief`;
  const company = `${SITE}/#deometals`;

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: `${CHIEF.fullName}, ${CHIEF.title}`,
        inLanguage: 'en-GH',
        publisher: { '@id': person },
      },
      {
        '@type': 'Person',
        '@id': person,
        name: CHIEF.fullName,
        alternateName: CHIEF.shortName,
        honorificPrefix: 'Nana',
        url: SITE,
        image: `${SITE}/img/chief-portrait.jpg`,
        jobTitle: `${CHIEF.title}, ${CHIEF.titleMeaning}`,
        description: `${CHIEF.titleMeaning} of ${CHIEF.place}, and a licensed precious metals dealer.`,
        knowsAbout: [
          'Akan traditional leadership',
          'Community development',
          'Precious metals trading',
        ],
        /* Add the office's confirmed accounts here. An unverified profile is
           worse than none: it teaches search engines the wrong entity. */
        sameAs: [],
        address: {
          '@type': 'PostalAddress',
          addressLocality: CHIEF.place,
          addressRegion: CHIEF.region,
          addressCountry: 'GH',
        },
        worksFor: { '@id': company },
      },
      {
        '@type': 'Organization',
        '@id': company,
        name: COMPANY.name,
        description: COMPANY.promise,
        parentOrganization: {
          '@type': 'Organization',
          name: 'DGSC Group',
        },
        knowsAbout: COMPANY.services,
        founder: { '@id': person },
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'GH',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE}/#faq`,
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

/* The editable half of the site comes from the store on every request, with
   a short revalidate, so a change made in the admin shows up promptly without
   making each visitor wait on a fetch. */
export const revalidate = 30;

export default async function Home() {
  const content = await readContent();

  return (
    <LensProvider>
      <ContactProvider value={content.contact}>
      <StructuredData />
      <MotionProvider />
      {/* The cloth the whole page is printed on */}
      <AdinkraCloth />
      <Nav />
      <main id="main" className="relative z-10">
        <Hero />
        <DualProfile />
        <TaglineReveal />
        <Kingdom gallery={content.gallery} />
        <Vision />
        <Projects />
        <Adinkra />
        <FilmFeature />
        <Media />
        <Events events={content.events} />
        <Updates updates={content.updates} />
        <Faq />
        <Engage />
      </main>
        <Footer />
      </ContactProvider>
    </LensProvider>
  );
}

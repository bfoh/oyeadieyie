import { MotionProvider } from '@/components/motion/MotionProvider';
import { AdinkraCloth } from '@/components/AdinkraCloth';
import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Chieftaincy } from '@/components/Chieftaincy';
import { Speeches } from '@/components/Speeches';
import { Development } from '@/components/Development';
import { Events } from '@/components/Events';
import { Culture } from '@/components/Culture';
import { News } from '@/components/News';
import { Gallery } from '@/components/Gallery';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
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
        affiliation: {
          '@type': 'Organization',
          name: CHIEF.authority,
          address: {
            '@type': 'PostalAddress',
            addressLocality: CHIEF.place,
            addressRegion: CHIEF.region,
            addressCountry: 'GH',
          },
        },
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
    <ContactProvider value={content.contact}>
      <StructuredData />
      <MotionProvider />
      {/* The cloth the whole page is printed on */}
      <AdinkraCloth />
      <Nav />
      {/* Nine chapters, in the order the office set out. The ids here are
          the nav's ids and the anchors readers share; NAV_LINKS is the one
          list that names them, so the two cannot drift apart. */}
      <main id="main" className="relative z-10">
        <Hero />
        <About />
        <Chieftaincy />
        <Speeches statements={content.statements} />
        <Development projects={content.projects} impact={content.impact} />
        <Events events={content.events} />
        <Culture />
        <News updates={content.updates} />
        <Gallery images={content.gallery} />
        <Contact />
      </main>
      <Footer />
    </ContactProvider>
  );
}

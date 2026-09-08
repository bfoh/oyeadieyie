import type { MetadataRoute } from 'next';
import { CHIEF } from '@/lib/content';

/* Installable on Android, where most of this site's traffic will come from. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${CHIEF.fullName}, ${CHIEF.title}`,
    short_name: 'Nana Oyeadieyie',
    description: `Official site of ${CHIEF.fullName}, ${CHIEF.titleMeaning} of ${CHIEF.place}.`,
    start_url: '/',
    display: 'standalone',
    background_color: '#111111',
    theme_color: '#111111',
    icons: [
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}

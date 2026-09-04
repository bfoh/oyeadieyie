/**
 * Authentic Akan adinkra symbols.
 *
 * Geometry taken from the public domain adinkra SVGs on Wikimedia Commons
 * (Category:SVG Adinkra symbols) rather than drawn by eye, so the proportions
 * match the traditional stamps. Only the colours changed, to currentColor.
 *
 * Each symbol here was rendered in isolation and checked against its known
 * form before being included. Several files in that category are simplified
 * icon redraws rather than the real stamps, and those were discarded.
 */

export type Glyph = { viewBox: string; el: React.ReactNode };

export const GLYPHS: Record<string, Glyph> = {
  adinkrahene: {
    viewBox: '0 0 120 120',
    el: (
    <>
      <circle cx="60" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
      <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
      <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
    </>
    ),
  },
  gyenyame: {
    viewBox: '-37.654 -4.726 510 510',
    el: (
    <>
      <path d="M180.475,11.245c11.609,15.968,7.794,46.741,26.767,55.644 c26.062-0.674,25.307-27.081,40.147-38.522c37.423-25.598,80.812-4.661,84.757,21.401c8.344,55.104-94.203,80.456-84.757,136.968 c9.536,33.494,46.84-40.814,80.296-4.281c29.544,65.467-102.894,51.963-95.405,99.257c8.479,69.408,83.598-43.18,99.866,7.75 c7.444,61.115-90.009,39.543-71.376,85.605c31.053,43.338,93.146-42.834,84.878-31.873c43.16-57.209,85.813-159.123,29.777-256.006 c99.626,91.095,71.729,313.357-69.21,350.594c14.787,9.459,18.504,36.646,8.087,48.568c-10.346,11.842-36.933,22.807-57.991,4.281 c-10.31-14.361,2.403-39.824-26.765-47.08c-18.745-4.664-32.433,39.398-55.647,52.135c-15.555,8.533-43.473,1.455-59.915-15.34 c-14.078-14.379-14.788-47.295,0.466-56.301c26.519-15.656,80.032-33.082,83.868-87.5c-5.471-40.646-59.689,35.025-84.756,8.559 c-34.083-68.123,83.784-46.83,89.217-102.725c-0.074-36.338-67.55,32.542-89.217-8.562c-38.333-69.896,114.667-36.896,93.68-94.165 c-24.013-47.731-112.56,5.376-147.334,72.364c-19.86,38.258-46.917,121.406-34.647,187.93 C-22.375,289.606-9.89,111.731,125.831,70.548c-16.777-6.39-21.382-28.988-8.3-51.689C125.911,4.318,159.07-11.08,180.475,11.245z" fill="currentColor" />
    </>
    ),
  },
  dwennimmen: {
    viewBox: '0 0 420 420',
    el: (
    <>
      <path d="M310,260a70,70,0,0,1,0,140,90,90,0,0,1,0-180H420V200H310a90,90,0,0,1,0-180,70,70,0,0,1,0,140,50,50,0,0,1,0-100,30,30,0,0,1,0,60,10,10,0,0,1,0-20,10,10,0,0,0,0-20,30,30,0,0,0,0,60,50,50,0,0,0,0-100,70,70,0,0,0,0,140A90,90,0,0,0,310,0,110.14715,110.14715,0,0,0,210,64.19983,110.14715,110.14715,0,0,0,110,0a90,90,0,0,0,0,180,70,70,0,0,0,0-140,50,50,0,0,0,0,100,30,30,0,0,0,0-60,10,10,0,0,0,0,20,10,10,0,0,1,0,20,30,30,0,0,1,0-60,50,50,0,0,1,0,100,70,70,0,0,1,0-140,90,90,0,0,1,0,180H0v20H110a90,90,0,0,1,0,180,70,70,0,0,1,0-140,50,50,0,0,1,0,100,30,30,0,0,1,0-60,10,10,0,0,1,0,20,10,10,0,0,0,0,20,30,30,0,0,0,0-60,50,50,0,0,0,0,100,70,70,0,0,0,0-140,90,90,0,0,0,0,180,110.14715,110.14715,0,0,0,100-64.19983A110.14715,110.14715,0,0,0,310,420a90,90,0,0,0,0-180,70,70,0,0,0,0,140,50,50,0,0,0,0-100,30,30,0,0,0,0,60,10,10,0,0,0,0-20,10,10,0,0,1,0-20,30,30,0,0,1,0,60,50,50,0,0,1,0-100ZM187.7818,232.2182a31.42132,31.42132,0,1,1,44.43646,0A31.42129,31.42129,0,0,1,187.7818,232.2182Z" transform="translate(0 0)" fill="currentColor" />
    </>
    ),
  },
  neaope: {
    viewBox: '0 0 126 126',
    el: (
    <>
      <rect x="10.5" y="10.5" width="105" height="105" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <polygon points="43 0 6 0 0 0 0 6 0 43 6 43 6 6 43 6 43 0" fill="currentColor" />
      <polygon points="43 126 6 126 0 126 0 120 0 83 6 83 6 120 43 120 43 126" fill="currentColor" />
      <polygon points="83 0 120 0 126 0 126 6 126 43 120 43 120 6 83 6 83 0" fill="currentColor" />
      <polygon points="83 126 120 126 126 126 126 120 126 83 120 83 120 120 83 120 83 126" fill="currentColor" />
      <path d="M83.01424,86,118.5,20.94278" transform="translate(-3 -3)" fill="currentColor" />
      <path d="M48.98576,86,13.5,20.94278" transform="translate(-3 -3)" fill="currentColor" />
      <polygon points="19.493 16.5 63 98.232 106.507 16.5 19.493 16.5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M12.50244,13.5,66,114.002,119.49805,13.5Zm4.99512,3H114.502L66,107.61719Z" transform="translate(-3 -3)" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <polygon points="29.693 35.662 27.7 38.302 63 104.617 63 98.232 29.693 35.662" fill="currentColor" />
      <polygon points="26.234 29.163 16.299 10.5 12.901 10.5 24.24 31.803 26.234 29.163" fill="currentColor" />
      <polygon points="22.248 34.443 10.5 12.374 10.5 18.759 20.254 37.084 22.248 34.443" fill="currentColor" />
      <polygon points="101.407 32.465 113.099 10.5 109.701 10.5 99.189 30.247 101.407 32.465" fill="currentColor" />
      <polygon points="96.747 34.834 63 98.232 63 104.617 98.965 37.052 96.747 34.834" fill="currentColor" />
      <polygon points="99.927 41.631 63 111.002 25.707 40.942 23.714 43.583 61.996 115.5 64.004 115.5 102.145 43.849 99.927 41.631" fill="currentColor" />
      <polygon points="103.202 35.477 105.42 37.695 115.5 18.759 115.5 12.375 103.202 35.477" fill="currentColor" />
      <path d="M66,21a44.99934,44.99934,0,0,0-4.44855,89.77832v-3.016a42.00555,42.00555,0,1,1,8.53577.03577v3.00781A44.99577,44.99577,0,0,0,66,21Z" transform="translate(-3 -3)" fill="currentColor" />
      <path d="M66,15a51,51,0,1,0,51,51A51.05773,51.05773,0,0,0,66,15Zm0,99a48,48,0,1,1,48-48A48.05405,48.05405,0,0,1,66,114Z" transform="translate(-3 -3)" fill="currentColor" />
      <line x1="60" y1="19.75719" x2="60" y2="95.73598" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <line x1="66" y1="19.75719" x2="66" y2="95.73598" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </>
    ),
  },
  boame: {
    viewBox: '0 0 72.18672 100',
    el: (
    <>
      <path d="M72.18672,50.00114a36.08963,36.08963,0,0,0-18.06656-31.223l3.31844-5.748H14.7495l3.31817,5.74715A36.01215,36.01215,0,0,0,18.06739,81.223L14.7495,86.96989H57.4386l-3.31817-5.74743A36.08565,36.08565,0,0,0,72.18672,50.00114ZM29.5788,18.4849H42.609V31.51512H29.5788Zm6.51511,62.52576A6.51511,6.51511,0,1,1,42.609,74.49555,6.51513,6.51513,0,0,1,36.09391,81.01066ZM49.601,73.39511,36.09391,50,22.58652,73.39566a26.98473,26.98473,0,0,1,0-46.79124L36.09391,50,49.601,26.605a26.98461,26.98461,0,0,1,0,46.79014Z" fill="currentColor" />
      <circle cx="36.09391" cy="6.5151" r="6.5151" fill="currentColor" />
      <rect x="29.57877" y="86.9698" width="13.0302" height="13.0302" fill="currentColor" />
    </>
    ),
  },
  neaonnim: {
    viewBox: '0 0 390 390',
    el: (
    <>
      <rect x="15" y="135" width="360" height="120" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="255" y1="15" x2="255" y2="375" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="135" y1="15" x2="135" y2="375" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="195" y1="15" x2="195" y2="135" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="195" y1="255" x2="195" y2="375" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="75" y1="135" x2="75" y2="255" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="315" y1="135" x2="315" y2="255" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="135" y1="195" x2="255" y2="195" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="255" y1="75" x2="360" y2="75" fill="none" stroke="currentColor" strokeWidth="30" strokeLinejoin="round" />
      <line x1="255" y1="15" x2="375" y2="15" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="135" y1="15" x2="15" y2="15" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="135" y1="315" x2="30" y2="315" fill="none" stroke="currentColor" strokeWidth="30" strokeLinejoin="round" />
      <line x1="135" y1="375" x2="15" y2="375" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="255" y1="315" x2="360" y2="315" fill="none" stroke="currentColor" strokeWidth="30" strokeLinejoin="round" />
      <line x1="255" y1="375" x2="375" y2="375" fill="none" stroke="currentColor" strokeWidth="30" strokeLinecap="square" strokeLinejoin="round" />
      <line x1="30" y1="75" x2="135" y2="75" fill="none" stroke="currentColor" strokeWidth="30" strokeLinejoin="round" />
    </>
    ),
  },
  akomantoso: {
    viewBox: '0 0 360 360.00003',
    el: (
    <>
      <rect x="2.0715" y="158.17229" width="355.85743" height="43.65519" transform="translate(179.9999 -74.55862) rotate(44.99998)" fill="currentColor" />
      <rect x="2.07108" y="158.1726" width="355.85743" height="43.65519" transform="translate(-74.55864 180) rotate(-45.00002)" fill="currentColor" />
      <circle cx="180.00021" cy="179.99989" r="93.92697" fill="currentColor" />
      <path d="M221.62489,36.41205C258.30564-.26872,302.342-15.70358,339.02283,20.97717s21.24584,80.71707-15.43491,117.39784" fill="currentColor" />
      <path d="M138.37517,323.58788c-36.68075,36.68077-80.71706,52.11574-117.39784,15.435S-.26861,258.3057,36.41214,221.62492" fill="currentColor" />
      <path d="M36.41194,138.37539C-.26884,101.69464-15.70352,57.658,20.97723,20.97727S101.69412-.26839,138.3749,36.41236" fill="currentColor" />
      <path d="M323.58776,221.62511c36.68078,36.68075,52.11592,80.71688,15.43517,117.39766s-80.71735,21.24611-117.39812-15.43464" fill="currentColor" />
    </>
    ),
  },
  akokonan: {
    viewBox: '0 0 5.01664 8.11701',
    el: (
    <>
      <path d="M24.79785,38.6048a2.54892,2.54892,0,0,0,.27918-.23212,2.3331,2.3331,0,0,0,.439-2.68213,1.9779,1.9779,0,0,0-2.207-1.08575A2.051,2.051,0,0,1,24.79785,35.988a1.70233,1.70233,0,0,1-.42755,1.678,1.5962,1.5962,0,0,1-.7627.43566.79856.79856,0,0,1-.72985-.06555A.72037.72037,0,0,1,22.612,37.316a.93359.93359,0,0,1,.69708-.71118,1.04419,1.04419,0,0,0-1.15069.52331,1.247,1.247,0,0,0-.08741.97669v.01782a2.41483,2.41483,0,0,0-1.32623.48187,2.41452,2.41452,0,0,0,1.32617.48212v.01819a1.24728,1.24728,0,0,0,.08747.97668,1.04426,1.04426,0,0,0,1.15069.52332.93375.93375,0,0,1-.69708-.71125.72042.72042,0,0,1,.26575-.72015.79874.79874,0,0,1,.72985-.06555,1.59592,1.59592,0,0,1,.7627.43573,1.70233,1.70233,0,0,1,.42755,1.678,2.05118,2.05118,0,0,1-1.48877,1.38324,1.978,1.978,0,0,0,2.207-1.08582,2.333,2.333,0,0,0-.439-2.68207A2.55,2.55,0,0,0,24.79785,38.6048Z" transform="translate(-20.74475 -34.54628)" fill="currentColor" />
    </>
    ),
  },
  mpuannum: {
    viewBox: '0 0 92.42641 92.42641',
    el: (
    <>
      <path d="M46.21323,36.2132l-10,10,10,10,10-10Zm0,15a5,5,0,1,1,5-5A5,5,0,0,1,46.21323,51.2132Z" fill="currentColor" />
      <circle cx="25" cy="25" r="2.5" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
      <circle cx="25" cy="67.42641" r="2.5" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="25" cy="67.42641" r="20" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
      <circle cx="67.42641" cy="25" r="2.5" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="67.42641" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
      <circle cx="67.42641" cy="67.42641" r="2.5" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="67.42641" cy="67.42641" r="20" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
    </>
    ),
  },
  nkyinkyim: {
    viewBox: '0 0 360 360',
    el: (
    <>
      <polygon points="360 51.429 360 0 0 0 0 51.429 0 64.286 0 115.714 308.571 115.714 308.571 128.571 0 128.571 0 180 0 192.857 0 244.286 308.571 244.286 308.571 257.143 0 257.143 0 308.571 0 360 51.429 360 51.429 308.571 102.857 308.571 102.857 360 154.286 360 154.286 308.571 205.714 308.571 205.714 360 257.143 360 257.143 308.571 308.571 308.571 308.571 360 360 360 360 308.571 360 257.143 360 244.286 360 192.857 51.429 192.857 51.429 180 360 180 360 128.571 360 115.714 360 64.286 51.429 64.286 51.429 51.429 360 51.429" fill="currentColor" />
    </>
    ),
  },
};

/**
 * The royal crest.
 *
 * An adinkra-derived lozenge over the stool line. One definition, used by the
 * public nav, the admin and the brand assets, so the mark can never drift
 * between the site and the paper it issues.
 */
export function Crest({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.5 20 12l-8 9.5L4 12 12 2.5Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 6.8 16.6 12 12 17.2 7.4 12 12 6.8Z" stroke="currentColor" strokeWidth="1.1" />
      <path d="M9.4 12h5.2" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

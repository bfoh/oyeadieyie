/**
 * A reveal marker, not an animator.
 *
 * The single GSAP system in MotionProvider picks these up. Keeping the
 * animation in one place means two systems never fight over the same
 * property, and content stays visible when JavaScript does not run.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  group = false,
  item = false,
}: {
  children: React.ReactNode;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'header';
  className?: string;
  group?: boolean;
  item?: boolean;
}) {
  const Component = Tag as React.ElementType;
  const attrs: Record<string, string> = {};
  if (group) attrs['data-reveal-group'] = '';
  else if (item) attrs['data-reveal-item'] = '';
  else {
    attrs['data-reveal'] = 'fade-up';
    if (delay) attrs['data-reveal-delay'] = String(delay / 1000);
  }

  return (
    <Component className={className} {...attrs}>
      {children}
    </Component>
  );
}

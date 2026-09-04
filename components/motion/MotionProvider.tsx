'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * The site's single motion system.
 *
 * Lenis is the ONLY smooth scroll engine here. It drives its RAF through the
 * GSAP ticker so ScrollTrigger and smooth scroll never disagree about where
 * the page is.
 *
 * Under prefers-reduced-motion nothing is initialised at all: no smooth
 * scroll, no scrubbing, no reveals. Final states render immediately because
 * the `has-motion` class that hides pre-reveal content is never added.
 */
export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reduceMotion) return;

    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, LenisModule] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('lenis'),
      ]);
      if (cancelled) return;

      const Lenis = LenisModule.default;
      gsap.registerPlugin(ScrollTrigger);
      gsap.defaults({ ease: 'power3.out', duration: 0.85 });

      const root = document.documentElement;
      root.classList.add('has-motion');

      const lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        anchors: { offset: -96 },
      });

      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      /* ---------------- text splitting ---------------- */

      // Decorative spans are hidden from assistive tech; the element keeps an
      // unsplit accessible name so screen readers hear the original sentence.
      function splitWords(el: HTMLElement) {
        if (el.dataset.motionSplit === 'true') return;
        const text = (el.textContent || '').trim();
        if (!text) return;

        el.setAttribute('aria-label', text);
        el.textContent = '';

        text.split(/(\s+)/).forEach((part) => {
          if (!part.trim()) {
            el.appendChild(document.createTextNode(part));
            return;
          }
          const mask = document.createElement('span');
          const word = document.createElement('span');
          mask.className = 'motion-word-mask';
          mask.setAttribute('aria-hidden', 'true');
          word.className = 'motion-word';
          word.textContent = part;
          mask.appendChild(word);
          el.appendChild(mask);
        });

        el.dataset.motionSplit = 'true';
      }

      const ctx = gsap.context(() => {
        /* ---------------- hero intro ---------------- */
        const hero = document.querySelector('[data-hero]');
        if (hero) {
          const tl = gsap.timeline({ delay: 0.15 });
          const q = (sel: string) => hero.querySelectorAll(sel);

          gsap.set(hero.querySelectorAll('[data-hero-item]'), { autoAlpha: 1 });

          const headline = hero.querySelector<HTMLElement>('[data-hero-headline]');
          if (headline) {
            const lines = headline.querySelectorAll('.hero-line');
            tl.fromTo(
              lines,
              { yPercent: 108, autoAlpha: 0 },
              {
                yPercent: 0,
                autoAlpha: 1,
                duration: 1.15,
                ease: 'power4.out',
                stagger: 0.12,
              },
              0.1,
            );
          }

          tl.fromTo(
            q('[data-hero-eyebrow]'),
            { y: 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9 },
            0,
          )
            .fromTo(
              q('[data-hero-sub]'),
              { y: 22, autoAlpha: 0, filter: 'blur(6px)' },
              { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1 },
              0.45,
            )
            .fromTo(
              q('[data-hero-cta] > *'),
              { y: 20, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.09 },
              0.62,
            )
            .fromTo(
              q('[data-hero-proof] li'),
              { y: 14, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07 },
              0.8,
            );
        }

        /* ---------------- section choreography ---------------- */
        // label first, heading second, media third, cards last
        gsap.utils.toArray<HTMLElement>('[data-choreo]').forEach((section) => {
          // querySelectorAll, not querySelector: if markup ever carries a
          // second label or lead, animating only the first would leave the
          // rest hidden by the CSS rule forever.
          const targets = [
            ...section.querySelectorAll('[data-choreo-label]'),
            ...section.querySelectorAll('[data-choreo-heading]'),
            ...section.querySelectorAll('[data-choreo-lead]'),
          ];
          if (!targets.length) return;

          gsap.set(targets, { autoAlpha: 1 });
          gsap.fromTo(
            targets,
            { y: 30, autoAlpha: 0, filter: 'blur(7px)' },
            {
              y: 0,
              autoAlpha: 1,
              filter: 'blur(0px)',
              duration: 1,
              ease: 'power4.out',
              stagger: 0.11,
              scrollTrigger: { trigger: section, start: 'top 78%', once: true },
            },
          );
        });

        /* ---------------- grouped reveals ---------------- */
        gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
          const items = group.querySelectorAll('[data-reveal-item]');
          if (!items.length) return;
          gsap.set(group, { autoAlpha: 1 });
          gsap.fromTo(
            items,
            { y: 38, autoAlpha: 0, filter: 'blur(8px)' },
            {
              y: 0,
              autoAlpha: 1,
              filter: 'blur(0px)',
              duration: 0.95,
              ease: 'power4.out',
              stagger: 0.075,
              scrollTrigger: { trigger: group, start: 'top 82%', once: true },
            },
          );
        });

        /* ---------------- single reveals ---------------- */
        gsap.utils
          .toArray<HTMLElement>('[data-reveal]:not([data-reveal-item])')
          .forEach((el) => {
            gsap.set(el, { autoAlpha: 1 });
            gsap.fromTo(
              el,
              { y: 34, autoAlpha: 0, filter: 'blur(8px)' },
              {
                y: 0,
                autoAlpha: 1,
                filter: 'blur(0px)',
                duration: 0.95,
                ease: 'power4.out',
                delay: Number(el.dataset.revealDelay || 0),
                scrollTrigger: { trigger: el, start: 'top 84%', once: true },
              },
            );
          });

        /* ---------------- clip reveals on documentary media ---------------- */
        gsap.utils.toArray<HTMLElement>('[data-image-reveal]').forEach((fig) => {
          gsap.set(fig, { autoAlpha: 1 });
          gsap
            .timeline({
              scrollTrigger: { trigger: fig, start: 'top 84%', once: true },
            })
            .fromTo(
              fig,
              { clipPath: 'inset(0 0 100% 0)' },
              { clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power4.out' },
            )
            .fromTo(
              fig.querySelector('img'),
              { scale: 1.08 },
              { scale: 1, duration: 1.3, ease: 'power4.out' },
              0,
            );
        });

        /* ---------------- scrubbed word reveal (the statement) ---------------- */
        gsap.utils.toArray<HTMLElement>('[data-scrub-words]').forEach((el) => {
          splitWords(el);
          const words = el.querySelectorAll('.motion-word');
          if (!words.length) return;

          gsap.set(el, { autoAlpha: 1 });
          gsap.set(words, { color: 'rgba(249,248,243,0.22)' });
          gsap.to(words, {
            color: 'rgba(249,248,243,1)',
            ease: 'none',
            stagger: 1,
            scrollTrigger: {
              trigger: el,
              start: 'top 78%',
              end: 'bottom 58%',
              scrub: 1.1,
            },
          });
        });

        /* ---------------- parallax ---------------- */
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((layer) => {
          const speed = Number(layer.dataset.parallax || 0.16);
          const section = layer.closest('[data-parallax-section]') || layer;
          gsap.to(layer, {
            y: () => window.innerHeight * speed * -1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
              invalidateOnRefresh: true,
            },
          });
        });

        /* ---------------- magnetic primary actions ---------------- */
        if (!window.matchMedia('(pointer: coarse)').matches) {
          gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
            const strength = Number(el.dataset.magnetic || 0.22);
            const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
            const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

            const move = (e: PointerEvent) => {
              const r = el.getBoundingClientRect();
              xTo((e.clientX - r.left - r.width / 2) * strength);
              yTo((e.clientY - r.top - r.height / 2) * strength);
            };
            const leave = () => {
              xTo(0);
              yTo(0);
            };

            el.addEventListener('pointermove', move);
            el.addEventListener('pointerleave', leave);
          });
        }
      });

      /* The `has-motion` class exists only to stop a flash of un-animated
         content in the moment before GSAP sets its start states. Once setup
         is done, every element GSAP manages carries its own inline style, so
         the blanket CSS rule has no job left.

         Dropping it matters: panels that re-mount on interaction (the profile
         tabs, the kingdom timeline) would otherwise be hidden by the rule with
         no ScrollTrigger of their own, and never appear again. */
      requestAnimationFrame(() => root.classList.remove('has-motion'));

      /* Measurements settle only after fonts and hero media land */
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      if (document.fonts?.ready) void document.fonts.ready.then(refresh);
      const refreshTimer = window.setTimeout(refresh, 600);

      cleanup = () => {
        window.clearTimeout(refreshTimer);
        window.removeEventListener('load', refresh);
        gsap.ticker.remove(tick);
        lenis.destroy();
        ctx.revert();
        ScrollTrigger.getAll().forEach((t) => t.kill());
        root.classList.remove('has-motion');
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [pathname]);

  return null;
}

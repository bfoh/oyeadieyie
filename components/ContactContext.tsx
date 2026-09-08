'use client';

import { createContext, useContext } from 'react';
import { CONTACT, isSupplied } from '@/lib/content';

/**
 * The office's contact details, as they currently stand.
 *
 * These are editable from the admin, so the client components that print them
 * take them from here rather than importing the build-time constants. The
 * shape and the rules are unchanged: a bracketed value counts as unset and its
 * line is omitted rather than printing a placeholder.
 */
export type Contact = {
  email: string;
  phone: string;
  press: string;
  whatsapp: string;
};

const FALLBACK: Contact = {
  email: CONTACT.email,
  phone: CONTACT.phone,
  press: CONTACT.press,
  whatsapp: CONTACT.whatsapp,
};

const Ctx = createContext<Contact>(FALLBACK);

export function ContactProvider({
  value,
  children,
}: {
  value: Contact;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** The value if it has been supplied, otherwise null. */
export function useContactValue(key: keyof Contact): string | null {
  const contact = useContext(Ctx);
  const v = contact[key];
  return isSupplied(v) ? v : null;
}

export function useWhatsappHref(message?: string): string | null {
  const n = useContactValue('whatsapp');
  if (!n) return null;
  const digits = n.replace(/\D/g, '');
  if (!digits) return null;
  return message
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${digits}`;
}

export function useTelHref(): string | null {
  const n = useContactValue('phone');
  return n ? `tel:${n.replace(/[^\d+]/g, '')}` : null;
}

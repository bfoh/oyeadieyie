import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ADMIN_COOKIE, verifyToken } from '@/lib/admin-auth';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  title: 'Palace admin',
  /* Never index the admin, and never follow a link out of it. */
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  /* The middleware only checks a cookie exists. This verifies it. */
  if (!verifyToken(token)) redirect('/admin/login');

  return (
    <div className="flex min-h-[100svh] flex-col bg-ebony text-ivory lg:flex-row">
      <AdminNav />
      <main className="flex-1 overflow-x-hidden px-300 py-400 sm:px-500 sm:py-500">
        <div className="mx-auto w-full max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}

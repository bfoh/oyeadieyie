import { ProjectManager } from '@/components/admin/ProjectManager';
import { readContent, storeConfigured } from '@/lib/store';

/* Always fresh: the office must see what it just changed, not a cached copy. */
export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const content = await readContent({ fresh: true });
  return (
    <>
      <header className="mb-400">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">The record</p>
        <h1 className="mt-100 font-display text-4xl font-600 leading-tight text-ivory sm:text-5xl">
          Development record
        </h1>
        <p className="mt-200 max-w-measure text-base leading-relaxed text-ivory/65">
          The projects and the figures above them, as the public sees them. A
          status here is a public claim, so move a project to Delivered when it
          is delivered and not before.
        </p>
      </header>
      <ProjectManager
        initialProjects={content.projects}
        initialImpact={content.impact}
        configured={storeConfigured()}
      />
    </>
  );
}

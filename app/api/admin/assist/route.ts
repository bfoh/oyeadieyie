import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-guard';
import { CHIEF, COMPANY } from '@/lib/content';

/**
 * The writing assistant.
 *
 * Drafts wording for a brand asset in the office's own register: the correct
 * style of address, British spelling, no marketing language. It only ever
 * proposes text into a field the office can edit and approve before anything
 * is printed, so a draft is a starting point rather than a publication.
 *
 * Routed through the Vercel AI Gateway, which authenticates from the
 * deployment's OIDC token in production and from AI_GATEWAY_API_KEY locally.
 */

const MODEL = 'anthropic/claude-sonnet-4.5';

/* What each kind of asset needs, in the terms a palace would use. */
const BRIEFS: Record<string, string> = {
  citation:
    'a citation read aloud when the stool honours somebody: one or two formal sentences beginning with the deed, never with the person',
  'durbar-invitation':
    'the occasion line of a durbar invitation: a short formal name for the gathering',
  letterhead:
    'the body of an official letter from the office, three short paragraphs at most',
  'quote-card':
    'a single line the chief could have said, in his own plain register, about development and the stool',
  announcement:
    'a headline announcing an event or a completed project, under twelve words',
  'press-header':
    'a press release headline, factual and under twelve words, naming what happened and where',
  'project-board':
    'the project line for a site board: what is being built, in plain words',
  programme:
    'an order of proceedings for a durbar, one item per line, in the order they happen',
  update:
    'a short dated update from the office: what happened, in two or three sentences a newspaper could quote',
  event: 'a short description of an event at the palace, two sentences at most',
};

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  let body: { kind?: string; instruction?: string; context?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const brief = BRIEFS[String(body.kind ?? '')] ?? 'text for an official document from the office';
  const instruction = String(body.instruction ?? '').trim().slice(0, 400);
  const context = String(body.context ?? '').trim().slice(0, 600);

  if (!instruction) {
    return NextResponse.json({ error: 'instruction_required' }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: MODEL,
      system: [
        `You write for the office of ${CHIEF.fullName}, the ${CHIEF.title} — the ${CHIEF.titleMeaning} — of ${CHIEF.place}, ${CHIEF.region}.`,
        `He also runs ${COMPANY.name}, ${COMPANY.group.replace(/^A member/, 'a member')}.`,
        `His own motto, never to be paraphrased: "${CHIEF.motto}"`,
        '',
        'House style, and it is not negotiable:',
        '- British spelling and punctuation.',
        '- Plain, exact, unhurried. This is a traditional office, not a brand.',
        '- Never use marketing language: no "excited to announce", no "proud to", no exclamation marks, no superlatives.',
        '- "Nana" is the honorific and is never dropped. Nkosuo Hene means Development Chief and is a working title, not an honorary one.',
        '- Claim nothing that has not been stated. If a figure or a date is not given to you, leave it out rather than inventing it.',
        '- Return only the text asked for. No preamble, no quotation marks around it, no options, no commentary.',
      ].join('\n'),
      prompt: [
        `Write ${brief}.`,
        context ? `\nWhat is already on the piece:\n${context}` : '',
        `\nThe office asks for: ${instruction}`,
      ].join('\n'),
    });

    return NextResponse.json({ text: text.trim() });
  } catch (err) {
    /* The most common cause by far is no gateway credentials, which is a
       configuration state rather than a fault, so say so plainly. */
    const message = err instanceof Error ? err.message : '';
    const unauthenticated = /api key|unauthor|oidc|credential/i.test(message);
    return NextResponse.json(
      { error: unauthenticated ? 'ai_not_configured' : 'generation_failed' },
      { status: unauthenticated ? 503 : 502 },
    );
  }
}

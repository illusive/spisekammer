// "Sådan regner appen" (S-010): the ground rules behind the dates, in plain words, and where the
// times come from. Linked from every keeping line and from Indstillinger.

import { Card, Page, SubPageHeader } from '../components/ui';
import type { Strings } from '../i18n/strings';
import { FOOD_SOURCE, FOOD_TYPES } from '../keeping/foodTypes';
import { usePageTitle } from '../lib/usePageTitle';
import { hrefs } from '../router';

const linkClass = 'inline-flex min-h-11 items-center font-bold underline underline-offset-4';

export function RulesScreen({ s }: { s: Strings }) {
  const t = s.rules;
  usePageTitle(t.title, s.appTitle);
  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.home} title={t.title} />
      <div className="flex flex-col gap-4">
        <p className="px-1 text-lg">{t.intro}</p>
        {t.sections.map((section) => (
          <Card key={section.title} className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">{section.title}</h2>
            <ul className="flex list-disc flex-col gap-2 pl-[20px]">
              {section.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Card>
        ))}
        <Card className="flex flex-col gap-2">
          <p>{t.source}</p>
          <p className="text-sm text-muted">{t.typesCount(FOOD_TYPES.length)}</p>
          <a href={FOOD_SOURCE.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {t.sourceLink}
          </a>
          <a href="https://foedevarestyrelsen.dk" target="_blank" rel="noopener noreferrer" className={linkClass}>
            {t.danishLink}
          </a>
        </Card>
      </div>
    </Page>
  );
}

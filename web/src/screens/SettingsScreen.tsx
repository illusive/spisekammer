// Indstillinger: language and appearance, then the places (S-013), the household (S-011) and how
// the app counts (S-010).

import { Card, Choice, LinkRow, Page, RowList, SubPageHeader } from '../components/ui';
import type { Lang, Strings } from '../i18n/strings';
import { usePageTitle } from '../lib/usePageTitle';
import { hrefs } from '../router';
import { setPreference, usePreferences, type LangPref, type ThemePref } from '../settings/preferences';

export function SettingsScreen({ lang, s }: { lang: Lang; s: Strings }) {
  const t = s.settings;
  const prefs = usePreferences();
  usePageTitle(t.title, s.appTitle);
  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.home} title={t.title} />
      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-5">
          <Choice<LangPref>
            name="lang"
            legend={t.language}
            value={prefs.lang}
            onChange={(v) => setPreference('lang', v)}
            options={(['system', 'da', 'en'] as const).map((v) => ({ value: v, label: t.languages[v], lang: v === 'en' ? 'en' : v === 'da' ? 'da' : lang }))}
          />
          <Choice<ThemePref> name="theme" legend={t.theme} value={prefs.theme} onChange={(v) => setPreference('theme', v)} options={(['system', 'light', 'dark'] as const).map((v) => ({ value: v, label: t.themes[v] }))} />
        </Card>
        <RowList>
          <LinkRow href={hrefs.places} title={s.placesScreen.settingsRow} subtitle={<span className="block text-sm text-muted">{s.placesScreen.settingsHint}</span>} />
          <LinkRow href={hrefs.household} title={s.household.settingsRow} subtitle={<span className="block text-sm text-muted">{s.household.settingsHint}</span>} />
          <LinkRow href={hrefs.rules} title={s.keep.howWeCount} />
        </RowList>
        <p className="px-1 text-sm text-muted">{t.version(__APP_BUILD__.date, __APP_BUILD__.commit)}</p>
      </div>
    </Page>
  );
}

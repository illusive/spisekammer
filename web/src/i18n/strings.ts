// Every user-facing text, in Danish (first) and English. A test keeps the two in step.

export type Lang = 'da' | 'en';

export interface Strings {
  appTitle: string;
  back: string;
  close: string;
  cancel: string;
  settingsOpen: string;
  homeTitle: string;
  searchPlaceholder: string;
  searchLabel: string;
  clearSearch: string;
  useSoon: string;
  useSoonEmpty: string;
  places: string;
  placeKinds: Record<'fridge' | 'freezer' | 'pantry', string>;
  itemCount: (n: number) => string;
  emptyPlace: string;
  comingSoon: string;
  settings: {
    title: string;
    language: string;
    languages: Record<'system' | 'da' | 'en', string>;
    theme: string;
    themes: Record<'system' | 'light' | 'dark', string>;
    version: (date: string, commit: string) => string;
  };
  offlineReady: string;
  updateReady: string;
  updateAction: string;
  dismiss: string;
}

export const strings: Record<Lang, Strings> = {
  da: {
    appTitle: 'Spisekammer',
    back: 'Tilbage',
    close: 'Luk',
    cancel: 'Annuller',
    settingsOpen: 'Indstillinger',
    homeTitle: 'Hvad har du?',
    searchPlaceholder: 'Søg i alt, du har',
    searchLabel: 'Søg i alt, du har',
    clearSearch: 'Ryd søgning',
    useSoon: 'Brug snart',
    useSoonEmpty: 'Intet skal bruges lige nu.',
    places: 'Steder',
    placeKinds: { fridge: 'Køleskab', freezer: 'Fryser', pantry: 'Skab' },
    itemCount: (n) => (n === 1 ? '1 ting' : `${n} ting`),
    emptyPlace: 'Intet her endnu.',
    comingSoon: 'Kommer snart: tilføj, scan og tag ud.',
    settings: {
      title: 'Indstillinger',
      language: 'Sprog',
      languages: { system: 'Følg telefonen', da: 'Dansk', en: 'English' },
      theme: 'Udseende',
      themes: { system: 'Følg telefonen', light: 'Lyst', dark: 'Mørkt' },
      version: (date, commit) => `Version fra ${date} (${commit})`,
    },
    offlineReady: 'Appen virker nu også uden internet.',
    updateReady: 'Der er en ny version af appen.',
    updateAction: 'Opdater',
    dismiss: 'Luk',
  },
  en: {
    appTitle: 'Spisekammer',
    back: 'Back',
    close: 'Close',
    cancel: 'Cancel',
    settingsOpen: 'Settings',
    homeTitle: 'What do you have?',
    searchPlaceholder: 'Search everything you have',
    searchLabel: 'Search everything you have',
    clearSearch: 'Clear search',
    useSoon: 'Use soon',
    useSoonEmpty: 'Nothing needs using right now.',
    places: 'Places',
    placeKinds: { fridge: 'Fridge', freezer: 'Freezer', pantry: 'Cupboard' },
    itemCount: (n) => (n === 1 ? '1 item' : `${n} items`),
    emptyPlace: 'Nothing here yet.',
    comingSoon: 'Coming soon: add, scan and take out.',
    settings: {
      title: 'Settings',
      language: 'Language',
      languages: { system: 'Follow the phone', da: 'Dansk', en: 'English' },
      theme: 'Appearance',
      themes: { system: 'Follow the phone', light: 'Light', dark: 'Dark' },
      version: (date, commit) => `Version from ${date} (${commit})`,
    },
    offlineReady: 'The app now works without internet too.',
    updateReady: 'There is a new version of the app.',
    updateAction: 'Update',
    dismiss: 'Close',
  },
};

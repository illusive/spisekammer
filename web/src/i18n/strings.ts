// Every user-facing text, in Danish (first) and English. A test keeps the two in step.

import type { Category } from '../inventory/categories';

export type Lang = 'da' | 'en';

export interface Strings {
  appTitle: string;
  back: string;
  close: string;
  cancel: string;
  loading: string;
  settingsOpen: string;
  homeTitle: string;
  searchPlaceholder: string;
  searchLabel: string;
  clearSearch: string;
  noMatches: (q: string) => string;
  places: string;
  placeKinds: Record<'fridge' | 'freezer' | 'pantry', string>;
  itemCount: (n: number) => string;
  emptyPlace: string;
  emptyHome: string;
  categories: Record<Category, string>;
  // Adding and scanning
  scan: string;
  add: string;
  addTitle: string;
  addHere: (place: string) => string;
  name: string;
  namePlaceholder: string;
  nameMissing: string;
  brand: string;
  category: string;
  change: string;
  place: string;
  count: string;
  size: string;
  sizePlaceholder: string;
  optional: string;
  added: (name: string, place: string) => string;
  addedCount: (n: number) => string;
  done: string;
  noBarcode: string;
  typeInstead: string;
  scanHelp: string;
  scanStarting: string;
  scanSeenNotRead: string;
  scanDenied: string;
  scanUnavailable: string;
  scanPrivacy: string;
  lookingUp: string;
  productFrom: (source: string) => string;
  lookupNotFound: string;
  lookupOffline: string;
  alreadyHave: (where: string) => string;
  inPlace: (n: number, place: string) => string;
  addMore: (n: number) => string;
  takeOne: string;
  takenOut: (name: string, left: number) => string;
  stocked: (name: string, total: number) => string;
  // A thing's sheet
  moveTo: string;
  moved: (name: string, place: string) => string;
  remove: string;
  removeConfirm: (name: string) => string;
  cannotUndo: string;
  removeOnClose: string;
  removed: (name: string) => string;
  settings: {
    title: string;
    language: string;
    languages: Record<'system' | 'da' | 'en', string>;
    theme: string;
    themes: Record<'system' | 'light' | 'dark', string>;
    fridge: string;
    fridgeOptions: Record<'off' | 'on', string>;
    fridgeHelp: string;
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
    loading: 'Henter …',
    settingsOpen: 'Indstillinger',
    homeTitle: 'Hvad har du?',
    searchPlaceholder: 'Søg i alt, du har',
    searchLabel: 'Søg i alt, du har',
    clearSearch: 'Ryd søgning',
    noMatches: (q) => `Intet matcher ”${q}”`,
    places: 'Steder',
    placeKinds: { fridge: 'Køleskab', freezer: 'Fryser', pantry: 'Skab' },
    itemCount: (n) => (n === 1 ? '1 ting' : `${n} ting`),
    emptyPlace: 'Intet her endnu.',
    emptyHome: 'Scan en vare, eller tilføj den med navn. Så kan du altid se, hvad du har.',
    categories: {
      meat: 'Kød',
      poultry: 'Fjerkræ',
      fish: 'Fisk',
      dairy: 'Mejeri og æg',
      produce: 'Frugt og grønt',
      bread: 'Brød',
      dry: 'Tørvarer',
      canned: 'Konserves og glas',
      drinks: 'Drikke',
      leftovers: 'Rester',
      frozen: 'Frost',
      other: 'Andet',
    },
    scan: 'Scan',
    add: 'Tilføj',
    addTitle: 'Tilføj',
    addHere: (place) => `Tilføj i ${place.toLowerCase()}`,
    name: 'Hvad er det?',
    namePlaceholder: 'Fx letmælk',
    nameMissing: 'Skriv, hvad det er.',
    brand: 'Mærke',
    category: 'Kategori',
    change: 'Skift',
    place: 'Hvor?',
    count: 'Antal',
    size: 'Størrelse',
    sizePlaceholder: 'Fx 1 l eller 500 g',
    optional: 'valgfri',
    added: (name, place) => `${name} er tilføjet i ${place.toLowerCase()}`,
    addedCount: (n) => (n === 1 ? '1 tilføjet' : `${n} tilføjet`),
    done: 'Færdig',
    noBarcode: 'Uden stregkode',
    typeInstead: 'Skriv i stedet',
    scanHelp: 'Hold stregkoden inden for rammen.',
    scanStarting: 'Starter kameraet …',
    scanSeenNotRead: 'Stregkoden ses, men kan ikke læses. Hold telefonen stille, lidt længere væk, og sørg for lys.',
    scanDenied: 'Appen fik ikke lov til at bruge kameraet. Du kan give lov i telefonens indstillinger – eller skrive navnet i stedet.',
    scanUnavailable: 'Kameraet kan ikke bruges her. Skriv navnet i stedet.',
    scanPrivacy: 'Med internet sender appen kun stregkoden til Open Food Facts for at finde varens navn.',
    lookingUp: 'Slår varen op …',
    productFrom: (source) => `Varens navn er fra ${source}.`,
    lookupNotFound: 'Varen blev ikke fundet. Skriv navnet – så husker appen stregkoden næste gang.',
    lookupOffline: 'Varen kan ikke slås op uden internet. Skriv navnet – så husker appen stregkoden næste gang.',
    alreadyHave: (where) => `Du har allerede: ${where}.`,
    inPlace: (n, place) => `${n} i ${place.toLowerCase()}`,
    addMore: (n) => (n === 1 ? 'Læg 1 til' : `Læg ${n} til`),
    takeOne: 'Tag 1 ud',
    takenOut: (name, left) => (left === 0 ? `${name} er taget ud` : `${name}: 1 taget ud, ${left} tilbage`),
    stocked: (name, total) => `${name}: nu ${total}`,
    moveTo: 'Flyt til',
    moved: (name, place) => `${name} er flyttet til ${place.toLowerCase()}`,
    remove: 'Slet',
    removeConfirm: (name) => `Vil du slette ${name}?`,
    cannotUndo: 'Det kan ikke fortrydes.',
    removeOnClose: 'Den slettes, når du lukker. Tryk + for at beholde den.',
    removed: (name) => `${name} er slettet`,
    settings: {
      title: 'Indstillinger',
      language: 'Sprog',
      languages: { system: 'Følg telefonen', da: 'Dansk', en: 'English' },
      theme: 'Udseende',
      themes: { system: 'Følg telefonen', light: 'Lyst', dark: 'Mørkt' },
      fridge: 'Køleskabet med i appen',
      fridgeOptions: { off: 'Nej', on: 'Ja' },
      fridgeHelp: 'Det i køleskabet skifter hver dag, så listen bliver hurtigt forkert. Fryseren og skabene er nemmere at holde styr på.',
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
    loading: 'Loading …',
    settingsOpen: 'Settings',
    homeTitle: 'What do you have?',
    searchPlaceholder: 'Search everything you have',
    searchLabel: 'Search everything you have',
    clearSearch: 'Clear search',
    noMatches: (q) => `Nothing matches “${q}”`,
    places: 'Places',
    placeKinds: { fridge: 'Fridge', freezer: 'Freezer', pantry: 'Cupboard' },
    itemCount: (n) => (n === 1 ? '1 item' : `${n} items`),
    emptyPlace: 'Nothing here yet.',
    emptyHome: 'Scan a product, or add it by name. Then you can always see what you have.',
    categories: {
      meat: 'Meat',
      poultry: 'Poultry',
      fish: 'Fish',
      dairy: 'Dairy and eggs',
      produce: 'Fruit and vegetables',
      bread: 'Bread',
      dry: 'Dry goods',
      canned: 'Tins and jars',
      drinks: 'Drinks',
      leftovers: 'Leftovers',
      frozen: 'Frozen',
      other: 'Other',
    },
    scan: 'Scan',
    add: 'Add',
    addTitle: 'Add',
    addHere: (place) => `Add to ${place.toLowerCase()}`,
    name: 'What is it?',
    namePlaceholder: 'E.g. milk',
    nameMissing: 'Enter what it is.',
    brand: 'Brand',
    category: 'Category',
    change: 'Change',
    place: 'Where?',
    count: 'Number',
    size: 'Size',
    sizePlaceholder: 'E.g. 1 l or 500 g',
    optional: 'optional',
    added: (name, place) => `${name} added to ${place.toLowerCase()}`,
    addedCount: (n) => `${n} added`,
    done: 'Done',
    noBarcode: 'No barcode',
    typeInstead: 'Type instead',
    scanHelp: 'Hold the barcode inside the frame.',
    scanStarting: 'Starting the camera …',
    scanSeenNotRead: 'The barcode is seen but cannot be read. Hold the phone still, a bit further away, in good light.',
    scanDenied: 'The app was not allowed to use the camera. You can allow it in the phone settings – or type the name instead.',
    scanUnavailable: 'The camera cannot be used here. Type the name instead.',
    scanPrivacy: 'With internet, the app sends only the barcode to Open Food Facts to find the product name.',
    lookingUp: 'Looking up the product …',
    productFrom: (source) => `Product name from ${source}.`,
    lookupNotFound: 'The product was not found. Type the name – the app remembers the barcode next time.',
    lookupOffline: 'The product cannot be looked up without internet. Type the name – the app remembers the barcode next time.',
    alreadyHave: (where) => `You already have: ${where}.`,
    inPlace: (n, place) => `${n} in the ${place.toLowerCase()}`,
    addMore: (n) => `Add ${n}`,
    takeOne: 'Take 1 out',
    takenOut: (name, left) => (left === 0 ? `${name} taken out` : `${name}: took 1 out, ${left} left`),
    stocked: (name, total) => `${name}: now ${total}`,
    moveTo: 'Move to',
    moved: (name, place) => `${name} moved to ${place.toLowerCase()}`,
    remove: 'Delete',
    removeConfirm: (name) => `Delete ${name}?`,
    cannotUndo: 'This cannot be undone.',
    removeOnClose: 'It is deleted when you close. Tap + to keep it.',
    removed: (name) => `${name} deleted`,
    settings: {
      title: 'Settings',
      language: 'Language',
      languages: { system: 'Follow the phone', da: 'Dansk', en: 'English' },
      theme: 'Appearance',
      themes: { system: 'Follow the phone', light: 'Light', dark: 'Dark' },
      fridge: 'Include the fridge',
      fridgeOptions: { off: 'No', on: 'Yes' },
      fridgeHelp: 'What is in the fridge changes every day, so the list soon goes wrong. The freezer and cupboards are easier to keep track of.',
      version: (date, commit) => `Version from ${date} (${commit})`,
    },
    offlineReady: 'The app now works without internet too.',
    updateReady: 'There is a new version of the app.',
    updateAction: 'Update',
    dismiss: 'Close',
  },
};

// Every user-facing text, in Danish (first) and English. A test keeps the two in step.

import type { Category } from '../inventory/categories';
import type { AccountError } from '../account/account';
import type { SizeUnit } from '../inventory/size';
import type { PlaceKind, PresetId } from '../places';
import type { LangPref } from '../settings/preferences';

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
  searchIn: (place: string) => string;
  clearSearch: string;
  noMatches: (q: string) => string;
  places: string;
  editPlaces: { label: string; text: string };
  placeKinds: Record<PlaceKind, string>;
  placeKindHints: Record<PlaceKind, string>;
  placePresets: Record<PresetId, string>;
  placeGone: string;
  placesScreen: {
    title: string;
    settingsRow: string;
    settingsHint: string;
    intro: string;
    add: string;
    addTitle: string;
    name: string;
    namePlaceholder: string;
    kind: string;
    save: string;
    added: (name: string) => string;
    saved: (name: string) => string;
    remove: string;
    removeConfirm: (name: string) => string;
    hasThings: (n: number) => string;
    moveTo: string;
    moveAndRemove: string;
    removed: (name: string) => string;
    lastPlace: string;
    orderHelp: string;
    sortAlphabetical: string;
    dragHandle: (name: string) => string;
    moveUp: string;
    moveDown: string;
    dnd: {
      instructions: string;
      picked: (name: string, at: number, of: number) => string;
      over: (name: string, at: number, of: number) => string;
      dropped: (name: string, at: number, of: number) => string;
      cancelled: (name: string) => string;
    };
  };
  itemCount: (n: number) => string;
  emptyPlace: string;
  emptyHome: string;
  categories: Record<Category, string>;
  // Adding and scanning
  scan: string;
  add: string;
  addTitle: string;
  name: string;
  namePlaceholder: string;
  nameMissing: string;
  change: string;
  place: string;
  count: string;
  size: string;
  sizePlaceholder: string;
  unit: string;
  units: Record<SizeUnit, string>;
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
  addMoreIn: (n: number, place: string) => string;
  addInto: (n: number, place: string) => string;
  takeOne: string;
  takeOneFrom: (place: string) => string;
  knownBarcode: string;
  takenOut: (name: string, left: number) => string;
  stocked: (name: string, total: number) => string;
  // A thing's sheet
  moveTo: string;
  moved: (name: string, place: string) => string;
  remove: string;
  cannotUndo: string;
  removeOnClose: string;
  removed: (name: string) => string;
  settings: {
    title: string;
    language: string;
    languages: Record<LangPref, string>;
    version: (date: string, commit: string) => string;
  };
  keep: {
    date: (date: string) => string;
    past: string;
    today: string;
    inDays: (n: number) => string;
    daysAgo: (n: number) => string;
    useSoon: string;
    whatIsIt: string;
    dateLabel: string;
    month: string;
    year: string;
    removeDate: string;
  };
  household: {
    title: string;
    settingsRow: string;
    settingsHint: string;
    notConfigured: string;
    offline: string;
    signInTitle: string;
    signInIntro: string;
    email: string;
    emailPlaceholder: string;
    sendCode: string;
    sending: string;
    codeSent: (email: string) => string;
    code: string;
    signIn: string;
    otherEmail: string;
    privacy: string;
    createTitle: string;
    createIntro: string;
    householdName: string;
    defaultName: string;
    create: string;
    joinTitle: string;
    joinIntro: string;
    inviteCode: string;
    join: string;
    members: string;
    owner: string;
    you: string;
    invite: string;
    inviteTitle: string;
    inviteIntro: string;
    inviteExpires: string;
    share: string;
    copy: string;
    copied: string;
    shareText: (code: string, link: string) => string;
    syncLater: string;
    leave: string;
    leaveConfirm: (name: string) => string;
    leaveBody: string;
    leaveLast: string;
    left: string;
    signOut: string;
    signedInAs: (email: string) => string;
    errors: Record<AccountError, string>;
  };
  onboarding: {
    title: string;
    intro: string;
    start: string;
    step: (n: number, of: number) => string;
    skip: string;
    back: string;
    next: string;
    placesTitle: string;
    placesIntro: string;
    placesNone: string;
    ownPlace: string;
    ownPlaceAdd: string;
    shareTitle: string;
    shareIntro: string;
    shareYes: string;
    shareYesHint: string;
    shareNo: string;
    shareNoHint: string;
    doneTitle: string;
    donePoints: string[];
    doneShare: string;
    finish: string;
  };
  nav: { label: string; search: string };
  where: { title: string; last: string };
  searchTitle: string;
  undo: string;
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
    searchIn: (place) => `Søg i ${place.toLowerCase()}`,
    clearSearch: 'Ryd søgning',
    noMatches: (q) => `Intet matcher ”${q}”`,
    places: 'Steder',
    editPlaces: { label: 'Rediger steder', text: 'Rediger' },
    placeKinds: { freezer: 'Frost', fridge: 'Køl', pantry: 'Tørvarer' },
    placeKindHints: { freezer: 'Fx en fryser eller et fryseskab.', fridge: 'Fx et køleskab.', pantry: 'Fx et skab, en kælder eller et viktualiekammer.' },
    placePresets: { freezer: 'Fryser', pantry: 'Skabe', larder: 'Viktualiekammer', fridge: 'Køleskab' },
    placeGone: 'Slettet sted',
    placesScreen: {
      title: 'Steder',
      settingsRow: 'Steder',
      settingsHint: 'Frysere, skabe og andre steder, du har ting',
      intro: 'Lav et sted for hver fryser, hvert skab eller rum, du vil holde styr på. I køleskabet giver du datoer som en dag, andre steder som en måned.',
      add: 'Tilføj sted',
      addTitle: 'Nyt sted',
      name: 'Navn',
      namePlaceholder: 'Fx Fryser i garagen',
      kind: 'Slags',
      save: 'Gem',
      added: (name) => `${name} er tilføjet`,
      saved: (name) => `${name} er gemt`,
      remove: 'Slet',
      removeConfirm: (name) => `Slet ${name}?`,
      hasThings: (n) => (n === 1 ? 'Der er 1 ting i. Hvor skal den hen?' : `Der er ${n} ting i. Hvor skal de hen?`),
      moveTo: 'Flyt til',
      moveAndRemove: 'Flyt og slet',
      removed: (name) => `${name} er slettet`,
      lastPlace: 'Du skal have mindst ét sted.',
      orderHelp: 'Hold på håndtaget, og træk et sted op eller ned.',
      sortAlphabetical: 'Sortér alfabetisk',
      dragHandle: (name) => `Flyt ${name}`,
      moveUp: 'Flyt op',
      moveDown: 'Flyt ned',
      dnd: {
        instructions: 'Tryk mellemrum for at tage stedet op. Flyt det med piletasterne, og tryk mellemrum igen for at sætte det. Escape fortryder.',
        picked: (name, at, of) => `${name} er taget op. Plads ${at} af ${of}.`,
        over: (name, at, of) => `${name} er over plads ${at} af ${of}.`,
        dropped: (name, at, of) => `${name} er sat på plads ${at} af ${of}.`,
        cancelled: (name) => `${name} blev ikke flyttet.`,
      },
    },
    itemCount: (n) => (n === 1 ? '1 ting' : `${n} ting`),
    emptyPlace: 'Intet her endnu.',
    emptyHome: 'Tryk på Scan eller + nederst for at lægge noget ind. Så kan du altid se, hvad du har.',
    categories: {
      meat: 'Kød og fjerkræ',
      fish: 'Fisk',
      dairy: 'Mejeri og æg',
      produce: 'Frugt og grønt',
      bread: 'Brød og kager',
      dry: 'Pasta, ris og mel',
      canned: 'Dåser og glas',
      spices: 'Krydderier og saucer',
      snacks: 'Snacks og slik',
      drinks: 'Drikkevarer',
      leftovers: 'Rester og færdigretter',
      other: 'Andet',
    },
    scan: 'Scan',
    add: 'Tilføj',
    addTitle: 'Tilføj',
    name: 'Hvad er det?',
    namePlaceholder: 'Fx letmælk',
    nameMissing: 'Skriv, hvad det er.',
    change: 'Skift',
    place: 'Sted',
    count: 'Antal',
    size: 'Størrelse',
    sizePlaceholder: 'Fx 500',
    unit: 'Enhed',
    units: { stk: 'stk.', pk: 'pk.', dåse: 'ds.', g: 'g', kg: 'kg', ml: 'ml', cl: 'cl', dl: 'dl', l: 'l' },
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
    addMore: (n) => `Læg ${n} til`,
    addMoreIn: (n, place) => `Læg ${n} til i ${place.toLowerCase()}`,
    addInto: (n, place) => `Læg ${n} i ${place.toLowerCase()}`,
    takeOne: 'Tag 1 ud',
    takeOneFrom: (place) => `Tag 1 ud af ${place.toLowerCase()}`,
    knownBarcode: 'Kendt fra en tidligere scanning.',
    takenOut: (name, left) => (left === 0 ? `${name} er taget ud` : `${name}: 1 taget ud, ${left} tilbage`),
    stocked: (name, total) => `${name}: nu ${total}`,
    moveTo: 'Flyt til',
    moved: (name, place) => `${name} er flyttet til ${place.toLowerCase()}`,
    remove: 'Slet',
    cannotUndo: 'Det kan ikke fortrydes.',
    removeOnClose: 'Den slettes, når du lukker. Tryk + for at beholde den.',
    removed: (name) => `${name} er slettet`,
    settings: {
      title: 'Indstillinger',
      language: 'Sprog',
      languages: { system: 'Følg telefonen', da: 'Dansk', en: 'English' },
      version: (date, commit) => `Version fra ${date} (${commit})`,
    },
    keep: {
      date: (date) => `Dato: ${date}`,
      past: 'Datoen er overskredet. Se, lugt og smag, før du bruger det. Kød, fisk og rester: smid det ud.',
      today: 'i dag',
      inDays: (n) => (n === 1 ? 'i morgen' : `om ${n} dage`),
      daysAgo: (n) => (n === 1 ? 'i går' : `for ${n} dage siden`),
      useSoon: 'Brug snart',
      whatIsIt: 'Slags',
      dateLabel: 'Dato',
      month: 'Måned',
      year: 'År',
      removeDate: 'Fjern dato',
    },
    household: {
      title: 'Del',
      settingsRow: 'Del',
      settingsHint: 'Del det, I har, med dem, du bor med',
      notConfigured: 'Deling er ikke sat op i denne version endnu.',
      offline: 'Du skal have internet for at logge ind og dele. Alt andet virker uden.',
      signInTitle: 'Del med husstanden',
      signInIntro: 'Log ind med din e-mail. Du får en mail med et link eller en kode, ingen adgangskode.',
      email: 'E-mail',
      emailPlaceholder: 'dig@eksempel.dk',
      sendCode: 'Send mail',
      sending: 'Sender …',
      codeSent: (email) => `Vi har sendt en mail til ${email}. Tryk på linket i den, i denne browser, eller skriv koden, hvis der er en. Den virker i en time.`,
      code: 'Kode fra e-mailen',
      signIn: 'Log ind',
      otherEmail: 'Brug en anden e-mail',
      privacy: 'Din e-mail bruges kun til at logge dig ind og vises for dem i din husstand. Data ligger i EU.',
      createTitle: 'Opret en husstand',
      createIntro: 'Så kan du invitere dem, du bor med.',
      householdName: 'Navn',
      defaultName: 'Hjem',
      create: 'Opret',
      joinTitle: 'Har du fået en kode?',
      joinIntro: 'Skriv koden fra den, der inviterede dig.',
      inviteCode: 'Kode',
      join: 'Bliv medlem',
      members: 'Medlemmer',
      owner: 'ejer',
      you: 'dig',
      invite: 'Inviter',
      inviteTitle: 'Invitation',
      inviteIntro: 'Send linket, eller læs koden op. Den, du inviterer, logger ind og skriver koden.',
      inviteExpires: 'Koden virker i 7 dage.',
      share: 'Del',
      copy: 'Kopiér link',
      copied: 'Linket er kopieret.',
      shareText: (code, link) => `Bliv en del af vores husstand i Spisekammer: ${link} (kode ${code})`,
      syncLater: 'Snart kan I se og ændre de samme ting. Indtil da ligger dine ting stadig kun på denne telefon.',
      leave: 'Forlad husstanden',
      leaveConfirm: (name) => `Forlad ${name}?`,
      leaveBody: 'Du kan blive medlem igen med en ny kode.',
      leaveLast: 'Du er den sidste. Husstanden og alt i den bliver slettet.',
      left: 'Du har forladt husstanden.',
      signOut: 'Log ud',
      signedInAs: (email) => `Logget ind som ${email}`,
      errors: {
        offline: 'Ingen forbindelse. Prøv igen, når du har internet.',
        invalidCode: 'Koden eller linket passer ikke, eller det er for gammelt. Prøv igen, eller bed om en ny mail.',
        rateLimit: 'For mange forsøg. Vent lidt, og prøv igen.',
        inviteNotFound: 'Koden findes ikke, eller den er udløbet. Bed om en ny.',
        alreadyInHousehold: 'Du er allerede med i en husstand. Forlad den først.',
        invalidEmail: 'Skriv en gyldig e-mail.',
        linkElsewhere: 'Linket virker kun i den browser, hvor du bad om det. Bed om en ny mail herfra.',
        unknown: 'Noget gik galt. Prøv igen.',
      },
    },
    onboarding: {
      title: 'Hold styr på det, du har',
      intro: 'Se, hvad der er i fryseren og skabene, og hvornår det skal bruges. Alt ligger på telefonen og virker uden internet.',
      start: 'Kom i gang',
      step: (n, of) => `Trin ${n} af ${of}`,
      skip: 'Spring over',
      back: 'Tilbage',
      next: 'Næste',
      placesTitle: 'Hvor har du ting?',
      placesIntro: 'Vælg de steder, du vil holde styr på. Du kan altid ændre dem under Indstillinger → Steder.',
      placesNone: 'Vælg mindst ét sted.',
      ownPlace: 'Eget sted',
      ownPlaceAdd: 'Tilføj',
      shareTitle: 'Vil du dele med dem, du bor med?',
      shareIntro: 'Så kan I se og ændre de samme ting. Det kræver, at du logger ind med din e-mail.',
      shareYes: 'Ja, sæt det op bagefter',
      shareYesHint: 'Du kommer til Del, når du er færdig.',
      shareNo: 'Ikke nu',
      shareNoHint: 'Du kan gøre det senere under Indstillinger → Del.',
      doneTitle: 'Du er klar',
      donePoints: [
        'Tryk på Scan eller Tilføj, og læg tingene ind en efter en.',
        'Giv tingene en dato, så samler appen det, der snart skal bruges, øverst.',
        'Dine ting ligger på telefonen og virker uden internet.',
      ],
      doneShare: 'Bagefter kommer du til Del, hvor du kan logge ind og invitere.',
      finish: 'Start',
    },
    nav: { label: 'Handlinger', search: 'Søg' },
    where: { title: 'Hvor lægger du ting?', last: 'Sidst brugt' },
    searchTitle: 'Søg',
    undo: 'Fortryd',
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
    searchIn: (place) => `Search ${place.toLowerCase()}`,
    clearSearch: 'Clear search',
    noMatches: (q) => `Nothing matches “${q}”`,
    places: 'Places',
    editPlaces: { label: 'Edit places', text: 'Edit' },
    placeKinds: { freezer: 'Frozen', fridge: 'Chilled', pantry: 'Dry goods' },
    placeKindHints: { freezer: 'E.g. a freezer or a freezer cabinet.', fridge: 'E.g. a fridge.', pantry: 'E.g. a cupboard, a cellar or a larder.' },
    placePresets: { freezer: 'Freezer', pantry: 'Cupboards', larder: 'Larder', fridge: 'Fridge' },
    placeGone: 'Deleted place',
    placesScreen: {
      title: 'Places',
      settingsRow: 'Places',
      settingsHint: 'Freezers, cupboards and other places you keep things',
      intro: 'Make a place for each freezer, cupboard or room you want to keep track of. In the fridge, dates are a day; elsewhere, a month.',
      add: 'Add place',
      addTitle: 'New place',
      name: 'Name',
      namePlaceholder: 'E.g. Garage freezer',
      kind: 'Kind',
      save: 'Save',
      added: (name) => `${name} added`,
      saved: (name) => `${name} saved`,
      remove: 'Delete',
      removeConfirm: (name) => `Delete ${name}?`,
      hasThings: (n) => (n === 1 ? 'There is 1 thing in it. Where should it go?' : `There are ${n} things in it. Where should they go?`),
      moveTo: 'Move to',
      moveAndRemove: 'Move and delete',
      removed: (name) => `${name} deleted`,
      lastPlace: 'You need at least one place.',
      orderHelp: 'Hold the handle and drag a place up or down.',
      sortAlphabetical: 'Sort alphabetically',
      dragHandle: (name) => `Move ${name}`,
      moveUp: 'Move up',
      moveDown: 'Move down',
      dnd: {
        instructions: 'Press space to pick the place up. Move it with the arrow keys and press space again to drop it. Escape cancels.',
        picked: (name, at, of) => `Picked up ${name}. Position ${at} of ${of}.`,
        over: (name, at, of) => `${name} is over position ${at} of ${of}.`,
        dropped: (name, at, of) => `${name} was dropped at position ${at} of ${of}.`,
        cancelled: (name) => `${name} was not moved.`,
      },
    },
    itemCount: (n) => (n === 1 ? '1 item' : `${n} items`),
    emptyPlace: 'Nothing here yet.',
    emptyHome: 'Tap Scan or + at the bottom to add something. Then you can always see what you have.',
    categories: {
      meat: 'Meat and poultry',
      fish: 'Fish',
      dairy: 'Dairy and eggs',
      produce: 'Fruit and vegetables',
      bread: 'Bread and cakes',
      dry: 'Pasta, rice and flour',
      canned: 'Tins and jars',
      spices: 'Spices and sauces',
      snacks: 'Snacks and sweets',
      drinks: 'Drinks',
      leftovers: 'Leftovers and ready meals',
      other: 'Other',
    },
    scan: 'Scan',
    add: 'Add',
    addTitle: 'Add',
    name: 'What is it?',
    namePlaceholder: 'E.g. milk',
    nameMissing: 'Enter what it is.',
    change: 'Change',
    place: 'Place',
    count: 'Number',
    size: 'Size',
    sizePlaceholder: 'E.g. 500',
    unit: 'Unit',
    units: { stk: 'pcs', pk: 'pack', dåse: 'can', g: 'g', kg: 'kg', ml: 'ml', cl: 'cl', dl: 'dl', l: 'l' },
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
    addMoreIn: (n, place) => `Add ${n} to ${place.toLowerCase()}`,
    addInto: (n, place) => `Put ${n} in ${place.toLowerCase()}`,
    takeOne: 'Take 1 out',
    takeOneFrom: (place) => `Take 1 out of ${place.toLowerCase()}`,
    knownBarcode: 'Known from an earlier scan.',
    takenOut: (name, left) => (left === 0 ? `${name} taken out` : `${name}: took 1 out, ${left} left`),
    stocked: (name, total) => `${name}: now ${total}`,
    moveTo: 'Move to',
    moved: (name, place) => `${name} moved to ${place.toLowerCase()}`,
    remove: 'Delete',
    cannotUndo: 'This cannot be undone.',
    removeOnClose: 'It is deleted when you close. Tap + to keep it.',
    removed: (name) => `${name} deleted`,
    settings: {
      title: 'Settings',
      language: 'Language',
      languages: { system: 'Follow the phone', da: 'Dansk', en: 'English' },
      version: (date, commit) => `Version from ${date} (${commit})`,
    },
    keep: {
      date: (date) => `Date: ${date}`,
      past: 'The date has passed. Look, smell and taste before you use it. Meat, fish and leftovers: throw them out.',
      today: 'today',
      inDays: (n) => (n === 1 ? 'tomorrow' : `in ${n} days`),
      daysAgo: (n) => (n === 1 ? 'yesterday' : `${n} days ago`),
      useSoon: 'Use soon',
      whatIsIt: 'Kind',
      dateLabel: 'Date',
      month: 'Month',
      year: 'Year',
      removeDate: 'Remove date',
    },
    household: {
      title: 'Share',
      settingsRow: 'Share',
      settingsHint: 'Share what you have with the people you live with',
      notConfigured: 'Sharing is not set up in this version yet.',
      offline: 'You need internet to sign in and share. Everything else works without.',
      signInTitle: 'Share with your household',
      signInIntro: 'Sign in with your email. You get an email with a link or a code, no password.',
      email: 'Email',
      emailPlaceholder: 'you@example.com',
      sendCode: 'Send email',
      sending: 'Sending …',
      codeSent: (email) => `We sent an email to ${email}. Tap the link in it, in this browser, or enter the code if there is one. It works for an hour.`,
      code: 'Code from the email',
      signIn: 'Sign in',
      otherEmail: 'Use another email',
      privacy: 'Your email is only used to sign you in and is shown to the people in your household. Data is kept in the EU.',
      createTitle: 'Create a household',
      createIntro: 'Then you can invite the people you live with.',
      householdName: 'Name',
      defaultName: 'Home',
      create: 'Create',
      joinTitle: 'Got a code?',
      joinIntro: 'Enter the code from the person who invited you.',
      inviteCode: 'Code',
      join: 'Join',
      members: 'Members',
      owner: 'owner',
      you: 'you',
      invite: 'Invite',
      inviteTitle: 'Invitation',
      inviteIntro: 'Send the link, or read the code out. The person you invite signs in and enters the code.',
      inviteExpires: 'The code works for 7 days.',
      share: 'Share',
      copy: 'Copy link',
      copied: 'The link is copied.',
      shareText: (code, link) => `Join our household in Spisekammer: ${link} (code ${code})`,
      syncLater: 'Soon you will see and change the same things. Until then, your things stay on this phone only.',
      leave: 'Leave the household',
      leaveConfirm: (name) => `Leave ${name}?`,
      leaveBody: 'You can join again with a new code.',
      leaveLast: 'You are the last one. The household and everything in it will be deleted.',
      left: 'You have left the household.',
      signOut: 'Sign out',
      signedInAs: (email) => `Signed in as ${email}`,
      errors: {
        offline: 'No connection. Try again when you have internet.',
        invalidCode: 'The code or link does not match, or it is too old. Try again, or ask for a new email.',
        rateLimit: 'Too many tries. Wait a little and try again.',
        inviteNotFound: 'The code does not exist or has expired. Ask for a new one.',
        alreadyInHousehold: 'You are already in a household. Leave it first.',
        invalidEmail: 'Enter a valid email.',
        linkElsewhere: 'The link only works in the browser where you asked for it. Ask for a new email from here.',
        unknown: 'Something went wrong. Try again.',
      },
    },
    onboarding: {
      title: 'Keep track of what you have',
      intro: 'See what is in the freezer and the cupboards, and when to use it. Everything stays on your phone and works without internet.',
      start: 'Get started',
      step: (n, of) => `Step ${n} of ${of}`,
      skip: 'Skip',
      back: 'Back',
      next: 'Next',
      placesTitle: 'Where do you keep things?',
      placesIntro: 'Choose the places you want to keep track of. You can always change them under Settings → Places.',
      placesNone: 'Choose at least one place.',
      ownPlace: 'Your own place',
      ownPlaceAdd: 'Add',
      shareTitle: 'Share with the people you live with?',
      shareIntro: 'Then you see and change the same things. It needs you to sign in with your email.',
      shareYes: 'Yes, set it up afterwards',
      shareYesHint: 'You go to Share when you are done.',
      shareNo: 'Not now',
      shareNoHint: 'You can do it later under Settings → Share.',
      doneTitle: 'You are ready',
      donePoints: [
        'Tap Scan or Add, and add things one after another.',
        'Give things a date, and the app gathers what to use soon at the top.',
        'Your things stay on your phone and work without internet.',
      ],
      doneShare: 'Next you go to Share, where you can sign in and invite.',
      finish: 'Start',
    },
    nav: { label: 'Actions', search: 'Search' },
    where: { title: 'Where are things going?', last: 'Last used' },
    searchTitle: 'Search',
    undo: 'Undo',
    offlineReady: 'The app now works without internet too.',
    updateReady: 'There is a new version of the app.',
    updateAction: 'Update',
    dismiss: 'Close',
  },
};

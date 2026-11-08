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
  placeKindHints: Record<'fridge' | 'freezer' | 'pantry', string>;
  placePresets: Record<'freezer' | 'pantry' | 'larder' | 'fridge', string>;
  placeGone: string;
  placesScreen: {
    title: string;
    settingsRow: string;
    settingsHint: string;
    intro: string;
    add: string;
    addTitle: string;
    editTitle: string;
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
  };
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
    version: (date: string, commit: string) => string;
  };
  keep: {
    estimate: (date: string) => string;
    useBy: (date: string) => string;
    bestBefore: (date: string) => string;
    range: (from: string, to: string) => string;
    pastEstimate: string;
    pastUseBy: string;
    pastBestBefore: string;
    today: string;
    inDays: (n: number) => string;
    daysAgo: (n: number) => string;
    noType: string;
    noTime: (place: string) => string;
    notRecommended: (place: string) => string;
    indefinitely: string;
    whenRipe: string;
    fridgeAfterOpening: string;
    packageOnly: string;
    roomHours: (n: number) => string;
    inDoubt: string;
    howWeCount: string;
    useSoon: string;
    whatIsIt: string;
    noTypeOption: (category: string) => string;
    opened: string;
    openedOn: (date: string) => string;
    openedToday: string;
    notOpened: string;
    packageDate: string;
    packageKind: string;
    packageKinds: { useBy: string; bestBefore: string };
    packageHelp: string;
    removeDate: string;
    unchecked: string;
  };
  rules: {
    title: string;
    intro: string;
    sections: { title: string; points: string[] }[];
    source: string;
    sourceLink: string;
    danishLink: string;
    typesCount: (n: number) => string;
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
    errors: { offline: string; invalidCode: string; rateLimit: string; inviteNotFound: string; alreadyInHousehold: string; invalidEmail: string; linkElsewhere: string; unknown: string };
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
    placeKinds: { freezer: 'Frost', fridge: 'Køl', pantry: 'Tørvarer' },
    placeKindHints: { freezer: 'Fx en fryser eller et fryseskab.', fridge: 'Fx et køleskab.', pantry: 'Fx et skab, en kælder eller et viktualiekammer.' },
    placePresets: { freezer: 'Fryser', pantry: 'Skabe', larder: 'Viktualiekammer', fridge: 'Køleskab' },
    placeGone: 'Slettet sted',
    placesScreen: {
      title: 'Steder',
      settingsRow: 'Steder',
      settingsHint: 'Frysere, skabe og andre steder, du har ting',
      intro: 'Lav et sted for hver fryser, hvert skab eller rum, du vil holde styr på. Slagsen afgør, hvor længe tingene holder.',
      add: 'Tilføj sted',
      addTitle: 'Nyt sted',
      editTitle: 'Ret sted',
      name: 'Navn',
      namePlaceholder: 'Fx Fryser i garagen',
      kind: 'Slags',
      save: 'Gem',
      added: (name) => `${name} er tilføjet`,
      saved: (name) => `${name} er gemt`,
      remove: 'Slet sted',
      removeConfirm: (name) => `Slet ${name}?`,
      hasThings: (n) => (n === 1 ? 'Der er 1 ting i. Hvor skal den hen?' : `Der er ${n} ting i. Hvor skal de hen?`),
      moveTo: 'Flyt til',
      moveAndRemove: 'Flyt og slet',
      removed: (name) => `${name} er slettet`,
      lastPlace: 'Du skal have mindst ét sted.',
    },
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
      version: (date, commit) => `Version fra ${date} (${commit})`,
    },
    keep: {
      estimate: (date) => `Brug senest ca. ${date}`,
      useBy: (date) => `Sidste anvendelsesdato ${date}`,
      bestBefore: (date) => `Bedst før ${date}`,
      range: (from, to) => `Vejledende: ${from}–${to}`,
      pastEstimate: 'Over den vejledende tid.',
      pastUseBy: 'Sidste anvendelsesdato er overskredet. Spis det ikke.',
      pastBestBefore: 'Bedst før-datoen er passeret. Se, lugt og smag, før du bruger det.',
      today: 'i dag',
      inDays: (n) => (n === 1 ? 'i morgen' : `om ${n} dage`),
      daysAgo: (n) => (n === 1 ? 'i går' : `for ${n} dage siden`),
      noType: 'Vælg, hvad det er, for at få en vejledende dato.',
      noTime: (place) => `Der er ingen vejledende tid for det i ${place.toLowerCase()}.`,
      notRecommended: (place) => `Det frarådes at opbevare det i ${place.toLowerCase()}.`,
      indefinitely: 'Holder sig meget længe.',
      whenRipe: 'Holder sig, til det er modent.',
      fridgeAfterOpening: 'Bør stå på køl, når det er åbnet.',
      packageOnly: 'Brug datoen på pakken. Skriv den ind, så holder appen øje med den.',
      roomHours: (n) => `Bør ikke stå uden for køl i mere end ${n} timer.`,
      inDoubt: 'Ved tvivl: smid ud.',
      howWeCount: 'Sådan regner appen',
      useSoon: 'Brug snart',
      whatIsIt: 'Slags',
      noTypeOption: (category) => `${category}, andet`,
      opened: 'Åbnet',
      openedOn: (date) => `Åbnet ${date}`,
      openedToday: 'Åbnet i dag',
      notOpened: 'Ikke åbnet',
      packageDate: 'Dato på pakken',
      packageKind: 'Hvilken dato?',
      packageKinds: { useBy: 'Sidste anvendelsesdato', bestBefore: 'Bedst før' },
      packageHelp: 'Står der "mindst holdbar til", er det bedst før.',
      removeDate: 'Fjern dato',
      unchecked: 'Navnet er ikke gennemset endnu.',
    },
    rules: {
      title: 'Sådan regner appen',
      intro: 'Datoerne i appen er vejledende. De kommer fra faste regler, ikke fra nogen, der har set din mad. Brug altid også dine sanser.',
      sections: [
        {
          title: 'Datoen på pakken kommer først',
          points: [
            'Har du skrevet datoen fra pakken, viser appen den.',
            'Sidste anvendelsesdato: appen giver aldrig en senere dato. Er varen åbnet eller tøet op, gælder den tidligste af datoen og appens vurdering.',
            'Bedst før (eller "mindst holdbar til"): vises, til varen er åbnet. Derefter bruger appen sin vurdering. Efter datoen kan maden ofte stadig bruges, hvis den ser, lugter og smager, som den skal.',
          ],
        },
        {
          title: 'Uden dato: en vurdering',
          points: [
            'Appen finder ud fra navnet, hvad det er, fx hakket oksekød. Du kan altid vælge noget andet.',
            'For hver slags mad har appen tider for frost, køl og tørvarer, og for når den er åbnet eller tøet op. Hvert af dine steder er en af de tre slags.',
            'Appen tæller fra den dag, varen kom på sin plads, blev åbnet eller tøet op, og bruger den korteste tid. Hakket oksekød holder 1–2 dage i køleskabet, så appen siger 1 dag.',
          ],
        },
        {
          title: 'Når du flytter den',
          points: [
            'I fryseren starter tiden forfra: fryserens tid fra den dag, varen kom i.',
            'Fra fryseren til køleskabet: tiden efter optøning, eller køleskabets tid, fra den dag varen blev taget op.',
            'Frarådes et sted, eller findes der ingen tid for det, viser appen ingen dato, kun en besked.',
          ],
        },
        {
          title: 'Ved tvivl: smid ud',
          points: [
            'Ved råt kød, fisk, rester og varer med sidste anvendelsesdato skriver appen "Ved tvivl: smid ud".',
            'Appen kan ikke se, hvordan maden er blevet behandlet. Har den stået varmt for længe, eller ser, lugter eller smager den forkert, så smid den ud.',
            'Hold køleskabet på højst 5 °C.',
          ],
        },
      ],
      source: 'Tiderne kommer fra USDA FoodKeeper, version 128 (september 2018), udgivet af det amerikanske landbrugsministeriums fødevaresikkerhedstjeneste (FSIS) som CC0. Tiderne er amerikanske og regner med et køleskab på 4 °C. De danske navne er vores egne, og nogle er endnu ikke gennemset.',
      sourceLink: 'FoodKeeper-data (data.gov)',
      danishLink: 'Fødevarestyrelsen (foedevarestyrelsen.dk)',
      typesCount: (n) => `Appen kender ${n} slags mad.`,
    },
    household: {
      title: 'Husstand',
      settingsRow: 'Husstand',
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
    placeKinds: { freezer: 'Frozen', fridge: 'Chilled', pantry: 'Dry goods' },
    placeKindHints: { freezer: 'E.g. a freezer or a freezer cabinet.', fridge: 'E.g. a fridge.', pantry: 'E.g. a cupboard, a cellar or a larder.' },
    placePresets: { freezer: 'Freezer', pantry: 'Cupboards', larder: 'Larder', fridge: 'Fridge' },
    placeGone: 'Deleted place',
    placesScreen: {
      title: 'Places',
      settingsRow: 'Places',
      settingsHint: 'Freezers, cupboards and other places you keep things',
      intro: 'Make a place for each freezer, cupboard or room you want to keep track of. Its kind decides how long things keep.',
      add: 'Add place',
      addTitle: 'New place',
      editTitle: 'Edit place',
      name: 'Name',
      namePlaceholder: 'E.g. Garage freezer',
      kind: 'Kind',
      save: 'Save',
      added: (name) => `${name} added`,
      saved: (name) => `${name} saved`,
      remove: 'Delete place',
      removeConfirm: (name) => `Delete ${name}?`,
      hasThings: (n) => (n === 1 ? 'There is 1 thing in it. Where should it go?' : `There are ${n} things in it. Where should they go?`),
      moveTo: 'Move to',
      moveAndRemove: 'Move and delete',
      removed: (name) => `${name} deleted`,
      lastPlace: 'You need at least one place.',
    },
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
      version: (date, commit) => `Version from ${date} (${commit})`,
    },
    keep: {
      estimate: (date) => `Use by about ${date}`,
      useBy: (date) => `Use by ${date}`,
      bestBefore: (date) => `Best before ${date}`,
      range: (from, to) => `For guidance: ${from}–${to}`,
      pastEstimate: 'Past the guidance time.',
      pastUseBy: 'The use-by date has passed. Do not eat it.',
      pastBestBefore: 'The best-before date has passed. Look, smell and taste before you use it.',
      today: 'today',
      inDays: (n) => (n === 1 ? 'tomorrow' : `in ${n} days`),
      daysAgo: (n) => (n === 1 ? 'yesterday' : `${n} days ago`),
      noType: 'Choose what it is to get a date for guidance.',
      noTime: (place) => `There is no guidance time for it in the ${place.toLowerCase()}.`,
      notRecommended: (place) => `Keeping it in the ${place.toLowerCase()} is not advised.`,
      indefinitely: 'Keeps for a very long time.',
      whenRipe: 'Keeps until ripe.',
      fridgeAfterOpening: 'Should go in the fridge once opened.',
      packageOnly: 'Go by the date on the package. Enter it, and the app keeps track of it.',
      roomHours: (n) => `Should not stay out of the fridge for more than ${n} hours.`,
      inDoubt: 'If in doubt, throw it out.',
      howWeCount: 'How the app counts',
      useSoon: 'Use soon',
      whatIsIt: 'Kind',
      noTypeOption: (category) => `${category}, other`,
      opened: 'Opened',
      openedOn: (date) => `Opened ${date}`,
      openedToday: 'Opened today',
      notOpened: 'Not opened',
      packageDate: 'Date on the package',
      packageKind: 'Which date?',
      packageKinds: { useBy: 'Use by', bestBefore: 'Best before' },
      packageHelp: 'Danish packages: "sidste anvendelsesdato" is use by; "bedst før" and "mindst holdbar til" are best before.',
      removeDate: 'Remove date',
      unchecked: 'The name has not been checked yet.',
    },
    rules: {
      title: 'How the app counts',
      intro: 'The dates in the app are for guidance. They come from fixed rules, not from anyone who has seen your food. Always use your senses too.',
      sections: [
        {
          title: 'The date on the package comes first',
          points: [
            'If you entered the date from the package, the app shows it.',
            'Use by: the app never gives a later date. Once it is opened or thawed, the earlier of the date and the app\u2019s estimate applies.',
            'Best before: shown until it is opened. Then the app uses its estimate. After the date, food can often still be used if it looks, smells and tastes as it should.',
          ],
        },
        {
          title: 'Without a date: an estimate',
          points: [
            'The app works out from the name what it is, for example minced beef. You can always choose something else.',
            'For each kind of food, the app has times for frozen, chilled and dry goods, and for after opening or thawing. Each of your places is one of the three kinds.',
            'The app counts from the day it came into its place, was opened or thawed, and uses the shortest time. Minced beef keeps 1–2 days in the fridge, so the app says 1 day.',
          ],
        },
        {
          title: 'When you move it',
          points: [
            'In the freezer the time starts again: the freezer time from the day it went in.',
            'From the freezer to the fridge: the time after thawing, or the fridge time, from the day it came out.',
            'Where a place is advised against, or there is no time for it, the app shows no date, only a note.',
          ],
        },
        {
          title: 'If in doubt, throw it out',
          points: [
            'For raw meat, fish, leftovers and anything with a use-by date, the app says "If in doubt, throw it out".',
            'The app cannot see how the food has been handled. If it has been warm for too long, or looks, smells or tastes wrong, throw it out.',
            'Keep the fridge at 5 °C or colder.',
          ],
        },
      ],
      source: 'The times come from USDA FoodKeeper, version 128 (September 2018), published by the US Department of Agriculture\u2019s Food Safety and Inspection Service (FSIS) as CC0. They are US times and assume a fridge at 4 °C. The Danish names are our own, and some have not been checked yet.',
      sourceLink: 'FoodKeeper data (data.gov)',
      danishLink: 'The Danish Veterinary and Food Administration (foedevarestyrelsen.dk, in Danish)',
      typesCount: (n) => `The app knows ${n} kinds of food.`,
    },
    household: {
      title: 'Household',
      settingsRow: 'Household',
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
    offlineReady: 'The app now works without internet too.',
    updateReady: 'There is a new version of the app.',
    updateAction: 'Update',
    dismiss: 'Close',
  },
};

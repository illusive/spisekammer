// Case and accents ignored for search and matching (from stead): å → a, é → e; æ and ø are
// separate Danish letters and are kept.
export function fold(text: string): string {
  return text
    .toLocaleLowerCase('da')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC');
}

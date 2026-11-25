import { describe, expect, it } from 'vitest';
import { categoryFromTags, guessCategory, readCategory, type Category } from './categories';

// Everyday names and the group a person would expect. A name the app does not know gives null
// ("Andet"), never a wrong group.
const EXPECTED: [string, Category | null][] = [
  ['Hakket oksekød 8-12%', 'meat'],
  ['Oksekød, hakket', 'meat'],
  ['Kyllingebryst', 'meat'],
  ['Frosne kyllingebryst', 'meat'],
  ['Hel kylling', 'meat'],
  ['Kalkunbryst', 'meat'],
  ['Bacon i skiver', 'meat'],
  ['Medisterpølse', 'meat'],
  ['Leverpostej', 'meat'],
  ['Frikadeller', 'meat'],
  ['Svinekoteletter', 'meat'],
  ['Flæskesteg', 'meat'],
  ['Chicken nuggets', 'meat'],
  ['Laks', 'fish'],
  ['Røget laks', 'fish'],
  ['Torskefilet', 'fish'],
  ['Rejer', 'fish'],
  ['Tun i vand', 'fish'],
  ['Makrel i tomat', 'fish'],
  ['Fiskefrikadeller', 'fish'],
  ['Fish fingers', 'fish'],
  ['Letmælk', 'dairy'],
  ['Minimælk', 'dairy'],
  ['Skummetmælk', 'dairy'],
  ['Smør', 'dairy'],
  ['Flødeost', 'dairy'],
  ['Revet ost', 'dairy'],
  ['Yoghurt naturel', 'dairy'],
  ['Skyr', 'dairy'],
  ['Æg', 'dairy'],
  ['Creme fraiche 18%', 'dairy'],
  ['Piskefløde', 'dairy'],
  ['Mozzarella', 'dairy'],
  ['Cheddar cheese', 'dairy'],
  ['Æbler', 'produce'],
  ['Bananer', 'produce'],
  ['Gulerødder', 'produce'],
  ['Kartofler', 'produce'],
  ['Hvidløg', 'produce'],
  ['Rødløg', 'produce'],
  ['Isbergsalat', 'produce'],
  ['Cherrytomater', 'produce'],
  ['Peberfrugt', 'produce'],
  ['Blomkål', 'produce'],
  ['Frosne ærter', 'produce'],
  ['Jordbær', 'produce'],
  ['Vandmelon', 'produce'],
  ['Grønne bønner', 'produce'],
  ['Rugbrød', 'bread'],
  ['Franskbrød', 'bread'],
  ['Toastbrød', 'bread'],
  ['Pølsebrød', 'bread'],
  ['Boller', 'bread'],
  ['Knækbrød', 'bread'],
  ['Tortillas', 'bread'],
  ['Wienerbrød', 'bread'],
  ['Pandekager', 'bread'],
  ['Spaghetti', 'dry'],
  ['Pasta', 'dry'],
  ['Ris', 'dry'],
  ['Jasminris', 'dry'],
  ['Hvedemel', 'dry'],
  ['Havregryn', 'dry'],
  ['Sukker', 'dry'],
  ['Røde linser', 'dry'],
  ['Couscous', 'dry'],
  ['Hakkede tomater', 'canned'],
  ['Flåede tomater', 'canned'],
  ['Tomatpuré', 'canned'],
  ['Kidneybønner', 'canned'],
  ['Kikærter', 'canned'],
  ['Baked beans', 'canned'],
  ['Butter beans', 'canned'],
  ['Jordbærsyltetøj', 'canned'],
  ['Appelsinmarmelade', 'canned'],
  ['Kokosmælk', 'canned'],
  ['Salt', 'spices'],
  ['Sort peber', 'spices'],
  ['Karry', 'spices'],
  ['Hønsebouillon', 'spices'],
  ['Kyllingefond', 'spices'],
  ['Ketchup', 'spices'],
  ['Sennep', 'spices'],
  ['Olivenolie', 'spices'],
  ['Sojasauce', 'spices'],
  ['Tomatsauce', 'spices'],
  ['Honning', 'spices'],
  ['Chips', 'snacks'],
  ['Mørk chokolade', 'snacks'],
  ['Lakrids', 'snacks'],
  ['Vingummi', 'snacks'],
  ['Is', 'snacks'],
  ['Vaniljeis', 'snacks'],
  ['Saltede peanuts', 'snacks'],
  ['Småkager', 'snacks'],
  ['Appelsinjuice', 'drinks'],
  ['Hyldeblomstsaft', 'drinks'],
  ['Sodavand', 'drinks'],
  ['Coca-Cola', 'drinks'],
  ['Øl', 'drinks'],
  ['Rødvin', 'drinks'],
  ['Danskvand', 'drinks'],
  ['Kaffe', 'drinks'],
  ['Te', 'drinks'],
  ['Rester', 'leftovers'],
  ['Lasagne', 'leftovers'],
  ['Tomatsuppe', 'leftovers'],
  ['Pizza', 'leftovers'],
  ['Pasta i tomatsauce', 'dry'],
  ['Opvaskemiddel', null],
  ['Køkkenrulle', null],
  ['', null],
];

describe('guessing the group from a name', () => {
  for (const [name, expected] of EXPECTED) {
    it(`${name || '(empty)'} → ${expected ?? 'none'}`, () => {
      expect(guessCategory(name)).toBe(expected);
    });
  }
  it('short words only count whole: "is" is not in "Isbergsalat", "øl" not in "Øllebrød"', () => {
    expect(guessCategory('Isbergsalat')).toBe('produce');
    expect(guessCategory('Prisme')).toBeNull();
  });
});

describe('Open Food Facts categories', () => {
  it('maps the common tags', () => {
    expect(categoryFromTags(['en:plant-based-foods', 'en:canned-foods', 'en:baked-beans'])).toBe('canned');
    expect(categoryFromTags(['en:beverages', 'en:sodas'])).toBe('drinks');
    expect(categoryFromTags(['en:chickens'])).toBe('meat');
    expect(categoryFromTags(['en:unknown'])).toBeNull();
  });
});

describe('records from before S-021', () => {
  it('poultry is meat, frozen is guessed again, unknown is other', () => {
    expect(readCategory('poultry', 'Kyllingebryst')).toBe('meat');
    expect(readCategory('frozen', 'Frosne ærter')).toBe('produce');
    expect(readCategory('frozen', 'Noget fra fryseren')).toBe('other');
    expect(readCategory('dry', 'Ris')).toBe('dry');
    expect(readCategory('nonsense', 'Ris')).toBe('other');
  });
});

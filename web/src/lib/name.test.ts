import { describe, expect, it } from 'vitest';
import { stripBrand, tidyName } from './name';

describe('tidyName', () => {
  it('gives a capital first letter and leaves the rest', () => {
    expect(tidyName('butter beans')).toBe('Butter beans');
    expect(tidyName('  hakket   oksekød ')).toBe('Hakket oksekød');
    expect(tidyName('BBQ sauce')).toBe('BBQ sauce');
    expect(tidyName('æbler')).toBe('Æbler');
  });
  it('turns ALL CAPS into ordinary text', () => {
    expect(tidyName('BUTTER BEANS')).toBe('Butter beans');
    expect(tidyName('RØDE LINSER 500G')).toBe('Røde linser 500g');
  });
  it('leaves names without letters alone', () => {
    expect(tidyName('7up')).toBe('7up');
    expect(tidyName('123')).toBe('123');
  });
});

describe('stripBrand', () => {
  it('takes the brand out, wherever it is', () => {
    expect(stripBrand('Heinz Baked Beans', 'Heinz')).toBe('Baked Beans');
    expect(stripBrand('Baked Beans - Heinz', 'Heinz')).toBe('Baked Beans');
    expect(stripBrand('Heinz’s Baked Beans', 'Heinz')).toBe('Baked Beans');
    expect(stripBrand('Hellmann’s Mayonnaise', 'Hellmann')).toBe('Mayonnaise');
    expect(stripBrand('Arla Letmælk', 'Arla, Arla Foods')).toBe('Letmælk');
    expect(stripBrand('Kraft Heinz Ketchup', 'Heinz, Kraft Heinz')).toBe('Ketchup');
  });
  it('only whole words, any case', () => {
    expect(stripBrand('Øko havregryn', 'ØKO')).toBe('havregryn');
    expect(stripBrand('Lurpak smør', 'Lur')).toBe('Lurpak smør');
  });
  it('null when only the brand is left, the name as it is without brands', () => {
    expect(stripBrand('Nutella', 'Nutella')).toBeNull();
    expect(stripBrand('Baked beans', undefined)).toBe('Baked beans');
    expect(stripBrand('Baked beans', '')).toBe('Baked beans');
  });
});

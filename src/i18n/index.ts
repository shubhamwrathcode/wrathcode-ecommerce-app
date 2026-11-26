import en, { Strings } from './en';

/**
 * Active strings. Multi-language is UI-ready (section 2.2): add a new file with
 * the same shape and switch on `ui.language`. v1 ships English only.
 */
const dictionaries: Record<string, Strings> = { en };

export let t: Strings = en;

export function setLanguage(lang: string) {
  t = dictionaries[lang] ?? en;
}

export { tf } from '@/utils/format';

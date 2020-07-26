import { IStore } from './store';
import logger from './logger';

export default class Translator {
  static instance : Translator;

  store : IStore;

  cache : Map<string, any> = new Map();

  defaultLanguage : string = 'en';

  path : string = '/i18n';

  constructor(store : IStore) {
    // singleton
    if (!Translator.instance) {
      Translator.instance = this;
    }
    this.store = Translator.instance.store || store;
    return Translator.instance;
  }

  setDefaultLanguage(defaultLanguage : string) {
    this.defaultLanguage = defaultLanguage;
  }

  setPath(path : string) {
    this.path = path;
  }

  // getLanguage gets the user's lanuage either from
  // store or from browser.
  getLanguage() {
    if (this.store.state.language) {
      return this.store.state.language;
    }
    const lang = navigator.languages
      ? navigator.languages[0]
      : navigator.language;
    const l = lang.substr(0, 2);
    this.store.set('language', l);
    return l;
  }

  // loadTranslations loads the translations for the given
  // language in the cache.
  async loadTranslations(lang? : string) {
    const l = lang || this.getLanguage();
    if (this.cache.has(l)) {
      return;
    }
    const path = `${this.path}/${l}.json`;
    try {
      const res = await fetch(path);
      const json = await res.json();
      this.cache.set(l, json);
    } catch (err) {
      logger.error(`unable to fetch language file from ${path}: ${err}`);
    }
  }

  // s returns the translated string for the given key
  s(key : string) : string {
    const lang = this.getLanguage();
    if (!this.cache.has(lang)) {
      logger.error(`language ${lang} not found in translator's cache - did you run loadTranslations(${lang})?`);
    } else {
      const translations = <any> this.cache.get(lang);
      // const text = key.split('.').reduce((obj, i) => obj[i], translations);
      const text = translations[key];
      if (text) {
        return String(text);
      }
      logger.warn(`${key} not found in translation ${lang}`);
      if (!this.cache.has(this.defaultLanguage)) {
        logger.error(`default language ${lang} not found in translator's cache`);
        return key;
      }
    }
    const def = <any> this.cache.get(this.defaultLanguage);
    const fallback = def[key];
    if (fallback) {
      return String(fallback);
    }
    logger.warn(`${key} not found in default translation ${this.defaultLanguage}`);
    return key;
  }
}

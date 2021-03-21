import { Store } from './store';
import logger from './logger';

export default class Translator {
  static instance : Translator;

  store : Store;

  cache : Map<string, any> = new Map();

  defaultLanguage : string = 'en';

  supportedLanguages : string[] = ['en'];

  baseUrl : string = '/i18n';

  constructor(store : Store) {
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

  setSupportedLanguages(supportedLanguages : string[]) {
    this.supportedLanguages = supportedLanguages;
  }

  setBaseUrl(url : string) {
    this.baseUrl = url;
  }

  // getLanguage gets the user's lanuage either from
  // store or from browser. If language is not supported,
  // return default language.
  getLanguage() {
    if (this.store.state.language) {
      if (!this.supportedLanguages.includes(this.store.state.language)) {
        this.store.set('language', this.defaultLanguage);
        return this.defaultLanguage;
      }
      return this.store.state.language;
    }
    const lang = navigator.languages
      ? navigator.languages[0]
      : navigator.language;
    const l = lang.substr(0, 2);
    if (!this.supportedLanguages.includes(l)) {
      this.store.set('language', this.defaultLanguage);
      return this.defaultLanguage;
    }
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
    const url = `${this.baseUrl}/${l}.json`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      this.cache.set(l, json);
    } catch (err) {
      logger.error(`unable to fetch language file from ${url}: ${err}`);
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

import logger from '../logger';

type DirectusGlobalQuery = {
  fields : string[]|undefined
  filter: string|{ [key : string]: any}|undefined
  deep : string|{ [key : string]: any}|undefined
};

// Directus is a helper class for api interactions with
// the directus data platform.
class Directus {
  // singleton
  static instance : Directus

  // baseurl to use for all queries
  baseUrl : string = ''

  // locale to use for queries
  locale : string = ''

  // default locale is the locale assumed for content
  // that is not nested in the translations relation
  defaultLocale : string = 'en'

  // the field name used on the parent collection as
  // an alias for the relation to the translations
  parentTranslationsFieldName : string = 'translations'

  // the field name used on the translation / child collection
  // containing the language code
  translationLanguageFieldName : string = 'languages_code'

  // determines if translations should be merged for all items
  mergeAllTranslations : boolean = true

  constructor() {
    // singleton
    if (!Directus.instance) {
      Directus.instance = this;
    }
    return Directus.instance;
  }

  /**
   * set directus base url
   * @param url base url
   */
  setBaseUrl(url : string) {
    this.baseUrl = url;
  }

  /**
   * set the default locale
   * @param defaultLocale default locale
   */
  setDefaultLocale(defaultLocale : string) {
    this.defaultLocale = defaultLocale;
  }

  /**
   * set the current locale
   * @param locale locale
   */
  setLocale(locale : string) {
    this.locale = locale;
  }

  /**
   * set if translations should be merged for all items
   * @param mergeAllTranslations true to merge all
   */
  setMergeAllTranslations(mergeAllTranslations : boolean) {
    this.mergeAllTranslations = mergeAllTranslations;
  }

  /**
   * overwrite the items data with data from the translation
   * @param items directus item
   * @returns translated item
   */
  mergeTranslations(items : { [key: string]: any }) : { [key: string]: any } {
    const it = items;
    if (this.locale === this.defaultLocale) {
      return it;
    }
    let translations = it[this.parentTranslationsFieldName];
    if (!translations) {
      logger.warn(`unable to merge translations as given object does not have a property named ${this.parentTranslationsFieldName}`);
      return it;
    }
    if (!Array.isArray(translations)) {
      logger.warn(`unable to merge translations, expected ${this.parentTranslationsFieldName} to be of type Array`);
      return it;
    }
    if (translations.length === 0) {
      logger.warn(`unable to merge translations, ${this.parentTranslationsFieldName} is empty`);
      return it;
    }
    translations = translations.filter(
      (translation) => translation[this.translationLanguageFieldName] === this.locale,
    );
    if (translations.length > 1) {
      logger.warn(`${this.parentTranslationsFieldName} contains more than one translations for locale ${this.locale}`);
    }
    const translation = translations[0];

    Object.entries(it).forEach((entry) => {
      const key = entry[0];
      if (Object.keys(translation).includes(key)) {
        it[key] = translation[key];
      } else {
        logger.warn(`no translation found for ${key}`);
      }
    });
    delete (it[this.translationLanguageFieldName]);
    return it;
  }

  /**
   * get directus items
   * @param collection directus collection
   * @param query query parameters
   * @returns directus item(s)
   */
  async getItems(collection : string,
    query? : DirectusGlobalQuery)
    : Promise<{ [key: string]: any }|[{ [key: string]: any }]> {
    const l = this.locale || this.defaultLocale;
    const q : DirectusGlobalQuery = query || {
      filter: undefined,
      fields: undefined,
      deep: undefined,
    };
    q.fields = q.fields || ['*'];
    if (q.deep && typeof q.deep !== 'string') {
      q.deep = JSON.stringify(q.deep);
    }
    // handle querying the translation
    if (l !== this.defaultLocale) {
      q.fields.push(`${this.parentTranslationsFieldName}.*`); // ensure lanuage relation is being resolved
      const languageFilter = `{ "${this.parentTranslationsFieldName}": { "_filter": { "${this.translationLanguageFieldName}": { "_eq": "${l}" }}}}`;
      q.deep = q.deep ? `{ "_and": [ ${q.deep}, ${languageFilter} ] ` : languageFilter; // filter translations for given language
    }
    const params = new URLSearchParams();
    if (q.fields) {
      params.append('fields', q.fields.join(','));
    }
    if (q.filter) {
      if (typeof q.filter !== 'string') {
        q.filter = JSON.stringify(q.filter);
      }
      params.append('filter', q.filter);
    }
    if (q.deep) {
      params.append('deep', q.deep);
    }
    // run query
    let url = `${this.baseUrl}/items/${collection}`;
    const p = params.toString();
    if (p.length > 0) {
      url += `?${p}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const data = (await response.json()).data;

    if (!this.mergeAllTranslations) {
      return data;
    }
    // merge translations
    if (!Array.isArray(data)) {
      return this.mergeTranslations(data);
    }
    const res = [] as unknown as [{ [key: string]: any }];
    data.forEach((d) => {
      res.push(this.mergeTranslations(d));
    });
    return res;
  }
}

export default new Directus();

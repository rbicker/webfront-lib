import logger from '../logger';

/**
 * directus type definitions: begin
 * (copied from directus sdk - items.d.ts)
 */
type ItemMetadata = {
  total_count?: number;
  filter_count?: number;
};
type QueryOne<T> = {
  fields?: keyof T | (keyof T)[] | '*' | '*.*' | '*.*.*' | string | string[];
  search?: string;
  deep?: Record<string, QueryMany<T>>;
  export?: 'json' | 'csv' | 'xml';
  filter?: Filter<T>;
  _filter?: Filter<T>; // for deep queries
};
type QueryMany<T> = QueryOne<T> & {
  sort?: Sort<T>;
  limit?: number;
  offset?: number;
  page?: number;
  meta?: keyof ItemMetadata | '*';
};
type Sort<T> = (`${Extract<keyof T, string>}` | `-${Extract<keyof T, string>}`)[];
type FilterOperators = '_eq' | '_neq' | '_contains' | '_ncontains' | '_in' | '_nin' | '_gt' | '_gte' | '_lt' | '_lte' | '_null' | '_nnull' | '_empty' | '_nempty';
type FilterOperator<T, K extends keyof T> = {
  [O in FilterOperators]?: Filter<T> | T[K];
};
type Filter<T> = {
  [K in keyof T]?:
  FilterOperator<T, K> | string | boolean | number | string[] | Record<string, any>;
};
/**
 * directus type definitions: end
 */

/**
 * Directus is a helper class for handling multilingual
 * directus data
 */
class MultiLanguageDirectus {
  // singleton
  static instance : MultiLanguageDirectus;

  // default locale is the locale assumed for content
  // that is not nested in the translations relation
  defaultLocale : string = 'en';

  // locale is the current locale for querying
  // items
  locale : string = 'en';

  // the field name used on the parent collection as
  // an alias for the relation to the translations
  parentTranslationsFieldName : string = 'translations';

  // the field name used on the translation / child collection
  // containing the language code
  translationLanguageFieldName : string = 'languages_code';

  constructor() {
    // singleton
    if (!MultiLanguageDirectus.instance) {
      MultiLanguageDirectus.instance = this;
    }
    return MultiLanguageDirectus.instance;
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
   * @param locale default locale
   */
  setLocale(locale : string) {
    this.locale = locale;
  }

  /**
   * build a query for receiving multi language data from directus,
   * based on given query.
   * @param locale language in which the content is requested
   * @param query existing query that needs to be modified
   * @returns modified query ensuring data for translations is included
   */
  buildMultiLanguageQuery = <T>(query? : QueryOne<T>) : QueryOne<T> => {
    const q : QueryOne<T> = query || {
      filter: undefined,
      fields: undefined,
      deep: undefined,
    };
    q.fields = q.fields || '*';
    // handle querying the translation
    if (this.locale !== this.defaultLocale) {
      // ensure translation is being included
      if (typeof q.fields === 'string' && q.fields !== '*.*' && q.fields !== '*.*.*') {
        q.fields = `${q.fields},${this.parentTranslationsFieldName}.*`;
      } else if (Array.isArray(q.fields)) {
        q.fields.push(`${this.parentTranslationsFieldName}.*` as keyof T & string);
      }
      // deep filter to include correct language
      q.deep = q.deep || {};
      q.deep[this.parentTranslationsFieldName] = {
        _filter: {
          [this.translationLanguageFieldName]: {
            _eq: this.locale,
          },
        } as unknown as Filter<T>,
      };
    }
    return q;
  };

  /**
   * overwrite the given item's data with data from the translation
   * @param items directus item
   * @returns translated item
   */
  mergeTranslation = <T>(item : T) : T => {
    if (this.locale === this.defaultLocale) {
      return item;
    }
    if (typeof item !== 'object' || item === null || Array.isArray(item) || item instanceof Function) {
      logger.warn('unable to merge translation as given parameter is not an object');
      return item;
    }
    const it = item as { [key: string]: any };
    let translations = it[this.parentTranslationsFieldName];
    if (!translations) {
      logger.warn(`unable to merge translations as given object does not have a property named ${this.parentTranslationsFieldName}`);
      return it as T;
    }
    if (!Array.isArray(translations)) {
      logger.warn(`unable to merge translations, expected ${this.parentTranslationsFieldName} to be of type Array`);
      return it as T;
    }
    if (translations.length === 0) {
      logger.warn(`unable to merge translations, ${this.parentTranslationsFieldName} is empty`);
      return it as T;
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
      if (key !== this.parentTranslationsFieldName) {
        if (Object.keys(translation).includes(key)) {
          it[key] = translation[key];
        } else {
          logger.warn(`no translation found for ${key}`);
        }
      }
    });

    delete (it[this.translationLanguageFieldName]);
    return it as T;
  };

  /**
   * overwrite the item(s) data with data from the translation
   * @param items directus item(s)
   * @returns translated item(s)
   */
  mergeTranslations = <T>(items : T) : T => {
    if (this.locale === this.defaultLocale) {
      return items;
    }
    if (Array.isArray(items)) {
      const result = items.map((it) => this.mergeTranslation(it));
      return result as unknown as T;
    }
    return this.mergeTranslation(items);
  };
}

export default new MultiLanguageDirectus();

import logger from '../logger';

class Strapi {
  // singleton
  static instance : Strapi

  // baseurl to use for all queries
  baseUrl : string = ''

  // locale to use for queries
  locale : string = ''

  // fallback locale to use if
  // query returns 404
  fallbackLocale : string = ''

  constructor() {
    // singleton
    if (!Strapi.instance) {
      Strapi.instance = this;
    }
    return Strapi.instance;
  }

  setBaseUrl(url : string) {
    this.baseUrl = url;
  }

  setLocale(locale : string) {
    this.locale = locale;
  }

  setFallbackLocale(fallbackLocale : string) {
    this.fallbackLocale = fallbackLocale;
  }

  // get runs a query for the given api ressource
  async get(apiId : string, locale :string|undefined = undefined) : Promise<any> {
    const l = locale || this.locale;
    let url = `${this.baseUrl}/${apiId}`;
    if (l !== '') {
      url += `?_locale=${l}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      // try fallback locale if not found
      if (response.status === 404 && l !== '' && l !== this.fallbackLocale) {
        logger.warn(`strapi ${apiId} not found with locale ${l}, using fallback locale ${this.fallbackLocale}`);
        return this.get(apiId, this.fallbackLocale);
      }
      throw Error(response.statusText);
    }
    return response.json();
  }
}

export default new Strapi();

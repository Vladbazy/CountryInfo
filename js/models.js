export class Country {
  
  constructor(rawData) {
    this.name = rawData.name?.common || 'Неизвестно';
    this.officialName = rawData.name?.official || 'Неизвестно';
    this.capital = rawData.capital?.[0] || 'Нет данных';
    this.population = rawData.population || 0;
    this.region = rawData.region || 'Не указан';
    this.subregion = rawData.subregion || 'Не указан';
    this.area = rawData.area || 0;
    this.flag = rawData.flags?.svg || rawData.flags?.png || '';
    this.languages = this.extractLanguages(rawData.languages);
    this.currencies = this.extractCurrencies(rawData.currencies);
    this.borders = rawData.borders || [];
    this.timezones = rawData.timezones || [];
  }

  extractLanguages(languages) {
    if (!languages) return 'Нет данных';
    return Object.values(languages).join(', ');
  }

  extractCurrencies(currencies) {
    if (!currencies) return 'Нет данных';
    const currencyNames = Object.values(currencies).map(curr => curr.name);
    return currencyNames.join(', ');
  }

  getFormattedPopulation() {
    return new Intl.NumberFormat('ru-RU').format(this.population);
  }

  getFormattedArea() {
    return new Intl.NumberFormat('ru-RU').format(this.area) + ' км²';
  }
}
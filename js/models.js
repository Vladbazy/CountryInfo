export class Country {
  
  constructor(rawData) {
    this.name = rawData.name?.common || 'Неизвестно';
    this.officialName = rawData.name?.official || 'Неизвестно';
    this.capital = rawData.capital?.[0] || 'Нет данных';
    this.population = rawData.population || 0;
    this.region = rawData.region || 'Не указан';
    this.area = rawData.area || 0;
    
    // Код страны для флага
    this.cca2 = rawData.cca2 || '';
    
    // ФЛАГ - многоуровневая система получения
    if (rawData.flags?.svg) {
      this.flag = rawData.flags.svg;
    } else if (rawData.flags?.png) {
      this.flag = rawData.flags.png;
    } else if (this.cca2) {
      // Fallback: используем код страны для получения флага
      this.flag = `https://flagcdn.com/w320/${this.cca2.toLowerCase()}.png`;
    } else {
      // Последний fallback
      this.flag = 'https://via.placeholder.com/320x200/4A90D9/FFFFFF?text=' + encodeURIComponent(this.name);
    }
    
    this.languages = this.extractLanguages(rawData.languages);
    this.currencies = this.extractCurrencies(rawData.currencies);
    this.borders = rawData.borders || [];
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
    if (!this.area) return 'Нет данных';
    return new Intl.NumberFormat('ru-RU').format(this.area) + ' км²';
  }
}
export class Country {
  
  constructor(rawData) {
    console.log('[MODEL] Сырые данные:', rawData);
    
    this.name = rawData.name?.common || 'Неизвестно';
    this.officialName = rawData.name?.official || 'Неизвестно';
    this.capital = rawData.capital?.[0] || 'Нет данных';
    this.population = rawData.population || 0;
    this.region = rawData.region || 'Не указан';
    this.subregion = rawData.subregion || 'Не указан';
    this.area = rawData.area || 0;
    
    // ФЛАГ - многоуровневый fallback
    if (rawData.flags?.svg) {
      this.flag = rawData.flags.svg;
      console.log('[MODEL] Флаг (SVG):', this.flag);
    } else if (rawData.flags?.png) {
      this.flag = rawData.flags.png;
      console.log('[MODEL] Флаг (PNG):', this.flag);
    } else if (rawData.cca2) {
      this.flag = `https://flagcdn.com/w320/${rawData.cca2.toLowerCase()}.png`;
      console.log('[MODEL] Флаг (fallback по коду):', this.flag);
    } else {
      this.flag = 'https://via.placeholder.com/320x200?text=No+Flag';
      console.warn('[MODEL] Флаг не найден, используем placeholder');
    }
    
    this.languages = this.extractLanguages(rawData.languages);
    this.currencies = this.extractCurrencies(rawData.currencies);
    this.borders = rawData.borders || [];
    this.timezones = rawData.timezones || [];
    this.cca2 = rawData.cca2 || '';
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
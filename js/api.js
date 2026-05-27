export class CountryAPI {
  
  static async fetchByName(name) {
    console.log('[API] Запрос страны:', name);
    
    try {
      const fields = 'name,capital,population,region,flags,cca2,languages,currencies,area';
      const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=${fields}`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('[API] Получены данные:', data);
      return data;
      
    } catch (error) {
      console.error('[API ERROR] Не удалось загрузить страну:', error);
      throw new Error('Страна не найдена. Проверьте правильность названия.');
    }
  }

  static async fetchByRegion(region) {
    console.log('[API] Загрузка стран региона:', region);
    
    try {
      const fields = 'name,capital,population,region,flags,cca2,languages,currencies,area';
      const url = `https://restcountries.com/v3.1/region/${region}?fields=${fields}`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('[API] Загружено стран региона:', data.length);
      return data;
      
    } catch (error) {
      console.error('[API ERROR] Не удалось загрузить регион:', error);
      throw new Error('Ошибка загрузки данных региона. Попробуйте позже.');
    }
  }

  static async fetchAll() {
    console.log('[API] Загрузка всех стран...');
    
    try {
      const fields = 'name,capital,population,region,flags,cca2,languages,currencies,area';
      const url = `https://restcountries.com/v3.1/all?fields=${fields}`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('[API] Загружено стран:', data.length);
      return data;
      
    } catch (error) {
      console.error('[API ERROR] Не удалось загрузить все страны:', error);
      throw new Error('Ошибка загрузки данных. Попробуйте позже.');
    }
  }
}
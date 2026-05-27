export class CountryAPI {
  
  static async fetchByName(name) {
    console.log('[API] Запрос страны:', name);
    
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[API] Получены данные:', data);
      return data;
      
    } catch (error) {
      console.error('[API ERROR] Не удалось загрузить страну:', error);
      throw new Error('Страна не найдена. Проверьте правильность названия.');
    }
  }

  static async fetchAll() {
    console.log('[API] Загрузка всех стран...');
    
    try {
      const response = await fetch('https://restcountries.com/v3.1/all');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[API] Загружено стран:', data.length);
      return data;
      
    } catch (error) {
      console.error('[API ERROR] Не удалось загрузить все страны:', error);
      throw new Error('Ошибка загрузки данных. Попробуйте позже.');
    }
  }

  static async fetchByRegion(region) {
    console.log('[API] Загрузка стран региона:', region);
    
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/region/${region}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[API] Загружено стран региона:', data.length);
      return data;
      
    } catch (error) {
      console.error('[API ERROR] Не удалось загрузить регион:', error);
      throw new Error('Ошибка загрузки данных региона.');
    }
  }
}
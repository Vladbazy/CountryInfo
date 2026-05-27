export class CountryAPI {
  
  static async fetchByName(name) {
    console.log('[API] Запрос страны:', name);
    
    try {
      // ДОБАВЛЕНО: flags и cca2 для отображения флага
      const fields = 'name,capital,population,region,flags,cca2,languages,currencies,area';
      const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=${fields}`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('[API] Получены данные:', data);
      console.log('[API] Флаг:', data[0]?.flags);
      console.log('[API] Код страны:', data[0]?.cca2);
      return data;
      
    } catch (error) {
      console.error('[API ERROR] Не удалось загрузить страну:', error);
      throw new Error('Страна не найдена. Проверьте правильность названия.');
    }
  }

  static async fetchAll() {
    console.log('[API] Загрузка всех стран...');
    
    try {
      const fields = 'name,capital,population,region,flags,cca2';
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
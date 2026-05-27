export class CountryAPI {
  
  static async fetchWithRetry(url, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        console.log(`[API] Попытка ${i + 1} не удалась, ждем ${delay}мс...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  static async fetchByName(name) {
    console.log('[API] Запрос страны:', name);
    try {
      const fields = 'name,capital,population,region,flags,cca2,languages,currencies,area';
      const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=${fields}`;
      
      const data = await this.fetchWithRetry(url);
      return data;
    } catch (error) {
      console.error('[API ERROR]', error);
      throw new Error('Страна не найдена.');
    }
  }

  static async fetchAll() {
    console.log('[API] Загрузка всех стран...');
    try {
      // ВАЖНО: включаем flags и cca2
      const fields = 'name,population,region,flags,cca2,capital,area';
      const url = `https://restcountries.com/v3.1/all?fields=${fields}`;
      
      const data = await this.fetchWithRetry(url, 2, 2000);
      console.log('[API] Загружено стран:', data.length);
      return data;
    } catch (error) {
      console.error('[API ERROR] Не удалось загрузить все страны:', error);
      throw new Error('Не удалось загрузить все страны. Попробуйте выбрать регион.');
    }
  }

  static async fetchByRegion(region) {
    console.log('[API] Загрузка региона:', region);
    try {
      // ВАЖНО: включаем flags и cca2
      const fields = 'name,population,region,flags,cca2,capital,area';
      const url = `https://restcountries.com/v3.1/region/${region}?fields=${fields}`;
      
      const data = await this.fetchWithRetry(url, 3, 1500);
      console.log('[API] Загружено стран региона:', data.length);
      return data;
    } catch (error) {
      console.error('[API ERROR] Не удалось загрузить регион:', error);
      throw new Error(`Не удалось загрузить регион ${region}.`);
    }
  }
}
import { CountryAPI } from './api.js';
import { Country } from './models.js';
import { UIView } from './ui.js';
import { 
  calculateStats, 
  sortByPopulation, 
  sortByName, 
  filterByRegion
} from './utils.js';

// Глобальное состояние приложения
const state = {
  username: '',
  allCountries: [],
  displayedCountries: [],
  currentRegion: 'all',
  currentSort: null,
  history: JSON.parse(localStorage.getItem('searchHistory')) || [],
  comparisonMode: false,
  selectedCountries: []
};

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
  console.log('[APP] Приложение загружено');
  loadUsernameFromStorage();
  initWelcomeScreen();
  initMainScreen();
});

// РАБОТА С ИМЕНЕМ ПОЛЬЗОВАТЕЛЯ
function loadUsernameFromStorage() {
  const saved = localStorage.getItem('countryApp_username');
  if (saved) {
    state.username = saved;
    console.log('[APP] Восстановлено имя из localStorage:', saved);
  }
}

function saveUsername(username) {
  state.username = username;
  localStorage.setItem('countryApp_username', username);
  console.log('[APP] Сохранено имя:', username);
}

// ПРИВЕТСТВИЕ
function initWelcomeScreen() {
  const nextBtn = document.getElementById('next-btn');
  const usernameInput = document.getElementById('username-input');

  if (usernameInput) {
    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') goToMainScreen();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', goToMainScreen);
  }
}

function goToMainScreen() {
  const usernameInput = document.getElementById('username-input');
  const username = usernameInput?.value.trim();

  if (!username) {
    UIView.showError('Пожалуйста, введите ваше имя!');
    return;
  }

  saveUsername(username);
  document.getElementById('greeting').textContent = `Привет, ${username}!`;
  UIView.toggleScreen('main-screen');
  
  setTimeout(() => {
    document.getElementById('search-input')?.focus();
  }, 100);
}

// ГЛАВНЫЙ ЭКРАН
function initMainScreen() {
  console.log('[INIT] Главный экран инициализирован');
  
  const searchInput = document.getElementById('search-input');
  const regionFilter = document.getElementById('region-filter');
  const loadAllBtn = document.getElementById('load-all-btn');
  const sortPopBtn = document.getElementById('sort-pop-btn');
  const sortNameBtn = document.getElementById('sort-name-btn');
  const clearComparisonBtn = document.getElementById('clear-comparison');

  if (!searchInput) {
    console.error('[ERROR] Элемент search-input не найден в HTML!');
    return;
  }

  // 1. Поиск по нажатию Enter
  searchInput.addEventListener('keypress', async (e) => {
    console.log('[KEY] Нажата клавиша:', e.key);
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      console.log('[SEARCH] Запрос:', query);
      if (query) {
        await handleSearch(query);
      }
    }
  });

  // 2. Автодополнение (при вводе текста)
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    if (val.length < 1) return;
    
    const matches = new Set();
    state.history.forEach(h => { 
      if (h.toLowerCase().includes(val)) matches.add(h); 
    });
    
    state.allCountries.forEach(c => {
      if (c.name.toLowerCase().includes(val)) {
        matches.add(c.name);
      }
    });
    
    UIView.updateSuggestions(Array.from(matches).slice(0, 6));
  });

  // 3. Фильтр по региону (с загрузкой из API)
if (regionFilter) {
  regionFilter.addEventListener('change', async (e) => {
    state.currentRegion = e.target.value;
    
    UIView.setLoading(true);
    
    try {
      if (state.currentRegion === 'all') {
        // Загружаем ВСЕ страны
        const rawData = await CountryAPI.fetchAll();
        state.allCountries = rawData.map(raw => new Country(raw));
      } else {
        // Загружаем страны конкретного региона
        const rawData = await CountryAPI.fetchByRegion(state.currentRegion);
        state.allCountries = rawData.map(raw => new Country(raw));
      }
      
      state.displayedCountries = [...state.allCountries];
      
      // Показываем статистику и рендерим
      const stats = calculateStats(state.allCountries);
      UIView.renderGlobalStats(stats, state.allCountries.length);
      
      // Скрываем режимы отображения отдельных стран
      document.getElementById('single-mode').classList.add('hidden');
      document.getElementById('comparison-mode').classList.add('hidden');
      
      // Показываем уведомление
      const regionName = state.currentRegion === 'all' ? 'всех стран' : `региона "${state.currentRegion}"`;
      console.log(`[INFO] Загружено ${state.allCountries.length} стран ${regionName}`);
      
    } catch (error) {
      console.error('[ERROR]', error);
      UIView.showError(error.message);
    } finally {
      UIView.setLoading(false);
    }
  });
}

  // 4. Загрузить всё (загружаем все страны)
if (loadAllBtn) {
  loadAllBtn.addEventListener('click', async () => {
    UIView.setLoading(true);
    
    try {
      const rawData = await CountryAPI.fetchAll();
      state.allCountries = rawData.map(raw => new Country(raw));
      state.displayedCountries = [...state.allCountries];
      
      const stats = calculateStats(state.allCountries);
      UIView.renderGlobalStats(stats, state.allCountries.length);
      
      document.getElementById('single-mode').classList.add('hidden');
      document.getElementById('comparison-mode').classList.add('hidden');
      
      alert(`✅ Загружено ${state.allCountries.length} стран!\n\nТеперь вы можете:\n- Искать конкретные страны\n- Сравнивать их между собой\n- Сортировать по населению`);
      
    } catch (error) {
      console.error('[ERROR]', error);
      UIView.showError('Не удалось загрузить все страны. Попробуйте выбрать регион.');
    } finally {
      UIView.setLoading(false);
    }
  });
}

  // 5. Сортировка по населению
  if (sortPopBtn) {
    sortPopBtn.addEventListener('click', () => {
      if (state.comparisonMode && state.selectedCountries.length > 1) {
        state.currentSort = state.currentSort === 'pop-asc' ? 'pop-desc' : 'pop-asc';
        state.selectedCountries = sortByPopulation(
          state.selectedCountries, 
          state.currentSort === 'pop-desc' ? 'desc' : 'asc'
        );
        renderComparison();
      }
    });
  }

  // 6. Сортировка по названию
  if (sortNameBtn) {
    sortNameBtn.addEventListener('click', () => {
      if (state.comparisonMode && state.selectedCountries.length > 1) {
        state.currentSort = state.currentSort === 'name-asc' ? 'name-desc' : 'name-asc';
        state.selectedCountries = sortByName(
          state.selectedCountries, 
          state.currentSort === 'name-desc' ? 'desc' : 'asc'
        );
        renderComparison();
      }
    });
  }

  // 7. Очистка сравнения
  if (clearComparisonBtn) {
    clearComparisonBtn.addEventListener('click', () => {
      state.comparisonMode = false;
      state.selectedCountries = [];
      document.getElementById('comparison-mode').classList.add('hidden');
      document.getElementById('single-mode').classList.remove('hidden');
    });
  }
}

// ПОИСК СТРАНЫ
async function handleSearch(query) {
  console.log('[HANDLE SEARCH] Запрос:', query);
  
  if (!query) {
    console.warn('[HANDLE SEARCH] Пустой запрос');
    return;
  }

  // Сохраняем в историю
  if (!state.history.includes(query)) {
    state.history.unshift(query);
    if (state.history.length > 10) state.history.pop();
    localStorage.setItem('searchHistory', JSON.stringify(state.history));
  }

  UIView.setLoading(true);
  
  try {
    console.log('[API] Запрос к API...');
    const raw = await CountryAPI.fetchByName(query);
    const country = new Country(raw[0]);
    console.log('[API] Получено:', country);
    
    // Если уже есть 2 страны в сравнении — заменяем первую
    if (state.comparisonMode && state.selectedCountries.length >= 2) {
      state.selectedCountries.shift();
    }
    
    state.selectedCountries.push(country);
    
    // Если выбрано 2 страны — включаем режим сравнения
    if (state.selectedCountries.length === 2) {
      state.comparisonMode = true;
      document.getElementById('single-mode').classList.add('hidden');
      document.getElementById('comparison-mode').classList.remove('hidden');
      renderComparison();
    } else {
      // Одиночный режим
      state.comparisonMode = false;
      document.getElementById('comparison-mode').classList.add('hidden');
      document.getElementById('single-mode').classList.remove('hidden');
      renderSingle(country);
    }
    
  } catch (err) {
    console.error('[ERROR] Ошибка поиска:', err);
    UIView.showError('Страна не найдена: ' + err.message);
    UIView.clearCountries();
    UIView.toggleStats(false);
  } finally {
    UIView.setLoading(false);
  }
}

// ПРИМЕНЕНИЕ ФИЛЬТРОВ И РЕНДЕР
function applyFiltersAndRender() {
  let filtered = filterByRegion(state.displayedCountries, state.currentRegion);
  UIView.renderCountries(filtered);
  const stats = calculateStats(filtered);
  UIView.renderStats(stats);
  UIView.setLoading(false);
}

// РЕНДЕР ОДНОЙ СТРАНЫ
function renderSingle(country) {
  console.log('[RENDER] Отображение страны:', country.name);
  
  const container = document.getElementById('single-mode');
  container.innerHTML = '';
  
  const card = document.createElement('article');
  card.className = 'country-card';
  
  const flagImg = document.createElement('img');
  flagImg.src = country.flag;
  flagImg.alt = `Флаг ${country.name}`;
  flagImg.style.cssText = 'width:100%;height:150px;object-fit:cover;border-radius:8px;margin-bottom:15px;border:1px solid #eee;';
  
  flagImg.onerror = function() {
    console.warn('[RENDER] Флаг не загрузился, используем fallback');
    this.src = `https://flagcdn.com/w320/${country.cca2?.toLowerCase() || 'zz'}.png`;
  };
  
  flagImg.addEventListener('error', function() {
    this.src = 'https://via.placeholder.com/320x200/4A90D9/FFFFFF?text=' + encodeURIComponent(country.name);
  }, { once: true });
  
  card.innerHTML = `
    <h3>${UIView.escapeHtml(country.name)}</h3>
    <p><strong>Столица:</strong> ${UIView.escapeHtml(country.capital)}</p>
    <p><strong>Население:</strong> ${country.getFormattedPopulation()}</p>
    <p><strong>Регион:</strong> ${UIView.escapeHtml(country.region)}</p>
    <p><strong>Языки:</strong> ${UIView.escapeHtml(country.languages)}</p>
    ${country.currencies !== 'Нет данных' ? 
      `<p><strong>Валюта:</strong> ${UIView.escapeHtml(country.currencies)}</p>` : ''}
    ${country.area > 0 ? 
      `<p><strong>Площадь:</strong> ${country.getFormattedArea()}</p>` : ''}
  `;
  
  card.insertBefore(flagImg, card.firstChild);
  container.appendChild(card);
  UIView.renderStats(calculateStats([country]));
}

// РЕНДЕР СРАВНЕНИЯ ДВУХ СТРАН
function renderComparison() {
  console.log('[RENDER] Сравнение стран:', state.selectedCountries);
  
  const slot1 = document.getElementById('country-1-slot');
  const slot2 = document.getElementById('country-2-slot');
  
  if (state.selectedCountries.length < 2) {
    slot1.innerHTML = '<p class="slot-placeholder">Выберите первую страну</p>';
    slot2.innerHTML = '<p class="slot-placeholder">Выберите вторую страну</p>';
    return;
  }
  
  const [country1, country2] = state.selectedCountries;
  
  slot1.innerHTML = createComparisonCard(country1);
  slot2.innerHTML = createComparisonCard(country2);
  
  // Показываем статистику сравнения
  const stats = calculateStats(state.selectedCountries);
  UIView.renderStats(stats);
}

// Создание карточки для сравнения
function createComparisonCard(country) {
  return `
    <img src="${country.flag}" alt="${country.name}" 
         onerror="this.src='https://flagcdn.com/w320/${country.cca2?.toLowerCase() || 'zz'}.png'"
         style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:10px;">
    <h4>${UIView.escapeHtml(country.name)}</h4>
    <p><strong>Столица:</strong> ${UIView.escapeHtml(country.capital)}</p>
    <p><strong>Население:</strong> ${country.getFormattedPopulation()}</p>
    <p><strong>Регион:</strong> ${UIView.escapeHtml(country.region)}</p>
    <p><strong>Площадь:</strong> ${country.getFormattedArea()}</p>
  `;
}

// ЭКСПОРТ ДЛЯ ТЕСТИРОВАНИЯ
if (typeof window !== 'undefined') {
  window.state = state;
  window.CountryAPI = CountryAPI;
  window.Country = Country;
}
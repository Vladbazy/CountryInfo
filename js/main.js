import { CountryAPI } from './api.js';
import { Country } from './models.js';
import { UIView } from './ui.js';
import { 
  calculateStats, 
  sortByPopulation, 
  sortByName, 
  filterByRegion,
  debounce 
} from './utils.js';

// Глобальное состояние приложения (ИСПРАВЛЕНО: appState → state)
const state = {
  username: '',
  allCountries: [],
  displayedCountries: [],
  currentRegion: 'all',
  currentSort: null,
  history: JSON.parse(localStorage.getItem('searchHistory')) || []  // ДОБАВЛЕНО
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
    state.username = saved;  // ИСПРАВЛЕНО: appState → state
    console.log('[APP] Восстановлено имя из localStorage:', saved);
  }
}

function saveUsername(username) {
  state.username = username;  // ИСПРАВЛЕНО: appState → state
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
  const sortPopBtn = document.getElementById('sort-pop-btn');
  const sortNameBtn = document.getElementById('sort-name-btn');

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
    state.history.forEach(h => { if (h.toLowerCase().includes(val)) matches.add(h); });
    state.allCountries.forEach(c => {
      if (c.name.toLowerCase().includes(val) || c.russianName?.toLowerCase().includes(val)) {
        matches.add(c.name);
      }
    });
    UIView.updateSuggestions(Array.from(matches).slice(0, 6));
  });

  // 3. Фильтр по региону
  if (regionFilter) {
    regionFilter.addEventListener('change', (e) => {
      state.currentRegion = e.target.value;  // ИСПРАВЛЕНО: state.region → state.currentRegion
      applyFiltersAndRender();  // ИСПРАВЛЕНО: applyFilters → applyFiltersAndRender
    });
  }

  // 4. Сортировка по населению
  if (sortPopBtn) {
    sortPopBtn.addEventListener('click', () => {
      state.currentSort = state.currentSort === 'pop-asc' ? 'pop-desc' : 'pop-asc';
      state.displayedCountries = sortByPopulation(state.displayedCountries, state.currentSort === 'pop-desc' ? 'desc' : 'asc');
      applyFiltersAndRender();
    });
  }

  // 5. Сортировка по названию
  if (sortNameBtn) {
    state.currentSort = state.currentSort === 'name-asc' ? 'name-desc' : 'name-asc';
    state.displayedCountries = sortByName(state.displayedCountries, state.currentSort === 'name-desc' ? 'desc' : 'asc');
    applyFiltersAndRender();
  }
}

// ПОИСК СТРАНЫ
async function handleSearch(query) {
  if (!query) return;

  // Сохраняем в историю
  if (!state.history.includes(query)) {
    state.history.unshift(query);
    if (state.history.length > 10) state.history.pop();
    localStorage.setItem('searchHistory', JSON.stringify(state.history));
  }

  UIView.setLoading(true);
  
  try {
    const raw = await CountryAPI.fetchByName(query);
    const country = new Country(raw[0]);
    
    renderSingle(country);
    
  } catch (err) {
    UIView.showError('Страна не найдена.');
    UIView.clearCountries();
    UIView.toggleStats(false);
  } finally {
    UIView.setLoading(false);
  }
}

// ЗАГРУЗКА ВСЕХ СТРАН
async function loadAllCountries() {
  UIView.setLoading(true);
  
  try {
    const rawData = await CountryAPI.fetchAll();
    state.allCountries = rawData.map(raw => new Country(raw));
    state.displayedCountries = [...state.allCountries];
    applyFiltersAndRender();
  } catch (error) {
    UIView.showError(error.message);
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

// РЕНДЕР ОДНОЙ СТРАНЫ (ДОБАВЛЕНО)
// РЕНДЕР ОДНОЙ СТРАНЫ
function renderSingle(country) {
  console.log('[RENDER] Отображение страны:', country.name);
  console.log('[RENDER] URL флага:', country.flag);
  
  const container = document.getElementById('countries-list');
  container.innerHTML = '';
  
  const card = document.createElement('article');
  card.className = 'country-card';
  
  // Создаем img элемент с обработчиком ошибок
  const flagImg = document.createElement('img');
  flagImg.src = country.flag;
  flagImg.alt = `Флаг ${country.name}`;
  flagImg.style.cssText = 'width:100%;height:150px;object-fit:cover;border-radius:8px;margin-bottom:15px;border:1px solid #eee;';
  
  // Если флаг не загрузился — используем placeholder
  flagImg.onerror = function() {
    console.warn('[RENDER] Флаг не загрузился, используем fallback');
    this.src = `https://flagcdn.com/w320/${country.cca2?.toLowerCase() || 'zz'}.png`;
  };
  
  // Второй fallback если и код страны не сработал
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
  
  // Вставляем флаг ПЕРВЫМ элементом
  card.insertBefore(flagImg, card.firstChild);
  
  container.appendChild(card);
  UIView.renderStats(calculateStats([country]));
}

// ЭКСПОРТ ДЛЯ ТЕСТИРОВАНИЯ
if (typeof window !== 'undefined') {
  window.state = state;
  window.CountryAPI = CountryAPI;
  window.Country = Country;
}
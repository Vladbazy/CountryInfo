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

// Глобальное состояние приложения
const appState = {
  username: '',
  allCountries: [],
  displayedCountries: [],
  currentRegion: 'all',
  currentSort: null
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
    appState.username = saved;
    console.log('[APP] Восстановлено имя из localStorage:', saved);
  }
}

function saveUsername(username) {
  appState.username = username;
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
  const searchInput = document.getElementById('search-input');
  const regionFilter = document.getElementById('region-filter');
  const loadAllBtn = document.getElementById('load-all-btn');
  const sortPopBtn = document.getElementById('sort-pop-btn');
  const sortNameBtn = document.getElementById('sort-name-btn');

  // Поиск с дебаунсом (чтобы не дёргать API при каждом символе)
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }

  // Фильтр по региону
  if (regionFilter) {
    regionFilter.addEventListener('change', (e) => {
      appState.currentRegion = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Загрузить все страны
  if (loadAllBtn) {
    loadAllBtn.addEventListener('click', loadAllCountries);
  }

  // Сортировка по населению
  if (sortPopBtn) {
    sortPopBtn.addEventListener('click', () => {
      appState.currentSort = appState.currentSort === 'pop-asc' ? 'pop-desc' : 'pop-asc';
      const order = appState.currentSort === 'pop-desc' ? 'desc' : 'asc';
      appState.displayedCountries = sortByPopulation(appState.displayedCountries, order);
      applyFiltersAndRender();
    });
  }

  // Сортировка по названию
  if (sortNameBtn) {
    sortNameBtn.addEventListener('click', () => {
      appState.currentSort = appState.currentSort === 'name-asc' ? 'name-desc' : 'name-asc';
      const order = appState.currentSort === 'name-desc' ? 'desc' : 'asc';
      appState.displayedCountries = sortByName(appState.displayedCountries, order);
      applyFiltersAndRender();
    });
  }
}

// ПОИСК СТРАНЫ
async function handleSearch() {
  const query = document.getElementById('search-input')?.value.trim();
  if (!query) return;

  UIView.setLoading(true);
  
  try {
    const rawData = await CountryAPI.fetchByName(query);
    appState.allCountries = rawData.map(raw => new Country(raw));
    appState.displayedCountries = [...appState.allCountries];
    applyFiltersAndRender();
  } catch (error) {
    UIView.showError(error.message);
    UIView.clearCountries();
    UIView.toggleStats(false);
  }
}

// ЗАГРУЗКА ВСЕХ СТРАН
async function loadAllCountries() {
  UIView.setLoading(true);
  
  try {
    const rawData = await CountryAPI.fetchAll();
    appState.allCountries = rawData.map(raw => new Country(raw));
    appState.displayedCountries = [...appState.allCountries];
    applyFiltersAndRender();
  } catch (error) {
    UIView.showError(error.message);
  }
}

// ПРИМЕНЕНИЕ ФИЛЬТРОВ И РЕНДЕР
function applyFiltersAndRender() {
  // Применяем фильтр по региону
  let filtered = filterByRegion(appState.displayedCountries, appState.currentRegion);
  
  // Рендерим
  UIView.renderCountries(filtered);
  
  // Считаем и показываем статистику
  const stats = calculateStats(filtered);
  UIView.renderStats(stats);
  
  UIView.setLoading(false);
}

// ЭКСПОРТ ДЛЯ ТЕСТИРОВАНИЯ
if (typeof window !== 'undefined') {
  window.appState = appState;
  window.CountryAPI = CountryAPI;
  window.Country = Country;
}
export function formatNumber(num) {
  return new Intl.NumberFormat('ru-RU').format(num);
}

export function calculateStats(countries) {
  console.log('[UTILS] Расчёт статистики для', countries.length, 'стран');
  
  if (!countries || countries.length === 0) {
    return {
      count: 0,
      totalPopulation: '0',
      avgPopulation: '0',
      mostPopulated: null
    };
  }
  
  const totalPop = countries.reduce((sum, c) => sum + (c.population || 0), 0);
  const avgPop = Math.round(totalPop / countries.length);
  
  const mostPopulated = countries.reduce((max, c) => 
    (c.population || 0) > (max.population || 0) ? c : max
  , countries[0]);
  
  return {
    count: countries.length,
    totalPopulation: formatNumber(totalPop),
    avgPopulation: formatNumber(avgPop),
    mostPopulated: mostPopulated
  };
}

export function sortByPopulation(countries, order = 'desc') {
  console.log('[UTILS] Сортировка по населению:', order);
  
  return [...countries].sort((a, b) => {
    const diff = (a.population || 0) - (b.population || 0);
    return order === 'desc' ? -diff : diff;
  });
}

export function sortByName(countries, order = 'asc') {
  console.log('[UTILS] Сортировка по названию:', order);
  
  return [...countries].sort((a, b) => {
    const result = (a.name || '').localeCompare(b.name || '', 'ru');
    return order === 'desc' ? -result : result;
  });
}

export function filterByRegion(countries, region) {
  console.log('[UTILS] Фильтрация по региону:', region);
  
  if (region === 'all' || !region) {
    return [...countries];
  }
  
  return countries.filter(c => c.region === region);
}

export function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
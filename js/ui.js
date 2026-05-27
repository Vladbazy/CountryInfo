export class UIView {
  
  static toggleScreen(screenId) {
    console.log('[UI] Переключение экрана:', screenId);
    
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
      screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
      targetScreen.classList.add('active');
    }
  }

    static renderCountries(countries) {
    console.log('[UI] Рендер стран:', countries.length);
    
    const container = document.getElementById('single-mode');
    if (!container) return;
    
    if (countries.length === 0) {
      container.innerHTML = '<p class="no-results">Страны не найдены</p>';
      return;
    }
    
    // Показываем контейнер и скрываем сравнение
    container.classList.remove('hidden');
    document.getElementById('comparison-mode').classList.add('hidden');
    
    container.innerHTML = countries.map(country => `
      <article class="country-card">
        <img src="${country.flag}" 
             alt="Флаг ${country.name}" 
             onerror="this.src='https://flagcdn.com/w320/${country.cca2?.toLowerCase() || 'zz'}.png'"
             style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:10px;border:1px solid #eee;">
        <h3>${this.escapeHtml(country.name)}</h3>
        <p><strong>Столица:</strong> ${this.escapeHtml(country.capital || 'Нет данных')}</p>
        <p><strong>Население:</strong> ${country.getFormattedPopulation()}</p>
        <p><strong>Регион:</strong> ${this.escapeHtml(country.region)}</p>
        ${country.area ? `<p><strong>Площадь:</strong> ${country.getFormattedArea()}</p>` : ''}
      </article>
    `).join('');
  }

  static renderStats(stats) {
    console.log('[UI] Рендер статистики:', stats);
    
    const panel = document.getElementById('stats-panel');
    if (!panel) return;
    
    panel.classList.remove('hidden');
    panel.innerHTML = `
      <h4>📊 Статистика</h4>
      <p>🌍 Стран показано: <strong>${stats.count}</strong></p>
      <p>👥 Всего населения: <strong>${stats.totalPopulation}</strong></p>
      <p>📈 Среднее население: <strong>${stats.avgPopulation}</strong></p>
      ${stats.mostPopulated ? 
        `<p>🏆 Самая населённая: <strong>${stats.mostPopulated.name}</strong></p>` : ''}
    `;
  }

  static clearCountries() {
    const container = document.getElementById('countries-list');
    if (container) container.innerHTML = '';
  }

  static toggleStats(show) {
    const panel = document.getElementById('stats-panel');
    if (panel) {
      panel.classList.toggle('hidden', !show);
    }
  }

  static showError(message) {
    console.error('[UI ERROR]', message);
    alert('⚠️ ' + message);
  }

  static setLoading(loading) {
    const container = document.getElementById('countries-list');
    if (!container) return;
    
    if (loading) {
      container.innerHTML = '<p class="loading">Загрузка данных...</p>';
    }
  }

  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

    static updateSuggestions(suggestions) {
    const datalist = document.getElementById('search-suggestions');
    if (!datalist) return;
    
    datalist.innerHTML = '';
    suggestions.forEach(text => {
      const option = document.createElement('option');
      option.value = text;
      datalist.appendChild(option);
    });
  }

  static renderGlobalStats(stats, totalCount) {
    console.log('[UI] Рендер глобальной статистики');
    
    const panel = document.getElementById('stats-panel');
    if (!panel) return;
    
    panel.classList.remove('hidden');
    panel.innerHTML = `
      <h4>🌍 Глобальная статистика</h4>
      <p> Всего стран в мире: <strong>${totalCount}</strong></p>
      <p>👥 Общее население: <strong>${stats.totalPopulation}</strong></p>
      <p>📈 Среднее население: <strong>${stats.avgPopulation}</strong></p>
      <p>🏆 Самая населённая: <strong>${stats.mostPopulated?.name || 'N/A'}</strong></p>
      <p style="margin-top:10px;color:#666;font-size:0.9em;">
        💡 Введите название страны для поиска или сравнения
      </p>
    `;
  }
}
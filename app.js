/* ============================================================
   SKYCAST — WEATHER APP LOGIC
   Uses Open-Meteo (free, no API key required)
   ============================================================ */

// ---- API ENDPOINTS ----
const API = {
  geocoding: 'https://geocoding-api.open-meteo.com/v1/search',
  weather:   'https://api.open-meteo.com/v1/forecast',
};

// ---- SVG WEATHER ICONS (Feather style) ----
const SVGS = {
  sun: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  cloud: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
  cloudSun: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="M5.3 5.3l1.4 1.4"/><path d="M20 12h2"/><path d="M18.7 5.3l-1.4 1.4"/><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
  cloudMoon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 0 0 21 12.79z"/><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
  rain: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="16" y1="19" x2="16" y2="21"/><line x1="16" y1="13" x2="16" y2="15"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="12" y1="15" x2="12" y2="17"/></svg>`,
  snow: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/><line x1="12" y1="17" x2="12" y2="17.01"/><line x1="8" y1="19" x2="8" y2="19.01"/><line x1="16" y1="19" x2="16" y2="19.01"/><line x1="12" y1="21" x2="12" y2="21.01"/></svg>`,
  lightning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/></svg>`,
  fog: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="19.78" y1="4.22" x2="18.36" y2="5.64"/></svg>`
};

// ---- WMO WEATHER CODES ----
const WMO_CODES = {
  0:  { desc: 'Clear sky',            icon: SVGS.sun,       night: SVGS.moon },
  1:  { desc: 'Mainly clear',         icon: SVGS.cloudSun,  night: SVGS.cloudMoon },
  2:  { desc: 'Partly cloudy',        icon: SVGS.cloudSun,  night: SVGS.cloudMoon },
  3:  { desc: 'Overcast',             icon: SVGS.cloud,     night: SVGS.cloud },
  45: { desc: 'Fog',                  icon: SVGS.fog,       night: SVGS.fog },
  48: { desc: 'Depositing rime fog',  icon: SVGS.fog,       night: SVGS.fog },
  51: { desc: 'Light drizzle',        icon: SVGS.rain,      night: SVGS.rain },
  53: { desc: 'Moderate drizzle',     icon: SVGS.rain,      night: SVGS.rain },
  55: { desc: 'Dense drizzle',        icon: SVGS.rain,      night: SVGS.rain },
  56: { desc: 'Freezing drizzle',     icon: SVGS.rain,      night: SVGS.rain },
  57: { desc: 'Dense freezing drizzle', icon: SVGS.rain,    night: SVGS.rain },
  61: { desc: 'Slight rain',          icon: SVGS.rain,      night: SVGS.rain },
  63: { desc: 'Moderate rain',        icon: SVGS.rain,      night: SVGS.rain },
  65: { desc: 'Heavy rain',           icon: SVGS.rain,      night: SVGS.rain },
  66: { desc: 'Freezing rain',        icon: SVGS.rain,      night: SVGS.rain },
  67: { desc: 'Heavy freezing rain',  icon: SVGS.rain,      night: SVGS.rain },
  71: { desc: 'Slight snow',          icon: SVGS.snow,      night: SVGS.snow },
  73: { desc: 'Moderate snow',        icon: SVGS.snow,      night: SVGS.snow },
  75: { desc: 'Heavy snow',           icon: SVGS.snow,      night: SVGS.snow },
  77: { desc: 'Snow grains',          icon: SVGS.snow,      night: SVGS.snow },
  80: { desc: 'Slight rain showers',  icon: SVGS.rain,      night: SVGS.rain },
  81: { desc: 'Moderate rain showers',icon: SVGS.rain,      night: SVGS.rain },
  82: { desc: 'Violent rain showers', icon: SVGS.lightning, night: SVGS.lightning },
  85: { desc: 'Slight snow showers',  icon: SVGS.snow,      night: SVGS.snow },
  86: { desc: 'Heavy snow showers',   icon: SVGS.snow,      night: SVGS.snow },
  95: { desc: 'Thunderstorm',         icon: SVGS.lightning, night: SVGS.lightning },
  96: { desc: 'Thunderstorm with hail', icon: SVGS.lightning, night: SVGS.lightning },
  99: { desc: 'Thunderstorm with heavy hail', icon: SVGS.lightning, night: SVGS.lightning },
};

// ---- DOM ELEMENTS ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  body:          $('#app-body'),
  themeToggle:   $('#theme-toggle'),
  locateBtn:     $('#locate-btn'),
  searchInput:   $('#search-input'),
  searchClear:   $('#search-clear'),
  searchResults: $('#search-results'),
  searchWrap:    $('#search-wrap'),
  skeleton:      $('#skeleton-loader'),
  weatherContent:$('#weather-content'),
  emptyState:    $('#empty-state'),
  errorState:    $('#error-state'),
  errorMessage:  $('#error-message'),
  errorRetry:    $('#error-retry'),
  popularTags:   $('#popular-tags'),
  // Hero
  cityName:      $('#city-name'),
  countryName:   $('#country-name'),
  currentTemp:   $('#current-temp'),
  weatherCondition: $('#weather-condition'),
  feelsLike:     $('#feels-like'),
  weatherCanvas: $('#weather-canvas'),
  localTime:     $('#local-time'),
  localDate:     $('#local-date'),
  // Metrics
  humidityVal:   $('#humidity-val'),
  humidityBar:   $('#humidity-bar'),
  windVal:       $('#wind-val'),
  windDir:       $('#wind-dir'),
  uvVal:         $('#uv-val'),
  uvBadge:       $('#uv-badge'),
  pressureVal:   $('#pressure-val'),
  visibilityVal: $('#visibility-val'),
  precipVal:     $('#precip-val'),
  sunriseVal:    $('#sunrise-val'),
  sunsetVal:     $('#sunset-val'),
  // Forecasts
  hourlyList:    $('#hourly-list'),
  dailyList:     $('#daily-list'),
  // Footer
  lastUpdated:   $('#last-updated'),
};

// ---- APPLICATION STATE ----
const state = {
  currentLocation: null,   // { name, country, lat, lon, timezone }
  searchTimeout: null,
  selectedResultIdx: -1,
  timeInterval: null,
};

// ============================================================
//  THEME
// ============================================================
function initTheme() {
  const saved = localStorage.getItem('skycast-theme');
  if (saved) {
    els.body.className = saved;
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    els.body.className = prefersDark ? 'dark-theme' : 'light-theme';
  }
}

function toggleTheme() {
  const isDark = els.body.classList.contains('dark-theme');
  els.body.className = isDark ? 'light-theme' : 'dark-theme';
  localStorage.setItem('skycast-theme', els.body.className);
}

// ============================================================
//  GEOCODING (Location Search)
// ============================================================
async function searchCities(query) {
  if (!query || query.trim().length < 2) {
    els.searchResults.innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`${API.geocoding}?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      els.searchResults.innerHTML = `<li class="search-result-item" style="justify-content:center;color:var(--text-tertiary);cursor:default;">No results found</li>`;
      return;
    }

    state.selectedResultIdx = -1;
    els.searchResults.innerHTML = data.results.map((r, i) => `
      <li class="search-result-item" role="option" data-idx="${i}"
          data-lat="${r.latitude}" data-lon="${r.longitude}"
          data-name="${escapeHtml(r.name)}" data-country="${escapeHtml(r.country || '')}"
          data-tz="${r.timezone || 'auto'}">
        <span class="result-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
        <span class="result-name">${escapeHtml(r.name)}</span>
        <span class="result-region">${escapeHtml(r.admin1 || '')}${r.admin1 && r.country ? ', ' : ''}${escapeHtml(r.country || '')}</span>
      </li>
    `).join('');
  } catch (err) {
    console.error('Geocoding error:', err);
    els.searchResults.innerHTML = '';
  }
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
//  WEATHER DATA FETCH
// ============================================================
async function fetchWeather(lat, lon, timezone = 'auto') {
  showLoading();

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: timezone,
    current: [
      'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
      'is_day', 'weather_code', 'wind_speed_10m', 'wind_direction_10m',
      'pressure_msl', 'precipitation', 'visibility', 'uv_index',
    ].join(','),
    hourly: [
      'temperature_2m', 'weather_code', 'precipitation_probability', 'is_day',
    ].join(','),
    daily: [
      'weather_code', 'temperature_2m_max', 'temperature_2m_min',
      'sunrise', 'sunset', 'uv_index_max', 'precipitation_probability_max',
    ].join(','),
    forecast_days: 7,
  });

  try {
    const res = await fetch(`${API.weather}?${params}`);
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const data = await res.json();
    renderWeather(data);
  } catch (err) {
    console.error('Weather fetch error:', err);
    showError(err.message || 'Failed to fetch weather data.');
  }
}

// ============================================================
//  RENDER WEATHER DATA
// ============================================================
function renderWeather(data) {
  const c = data.current;
  const h = data.hourly;
  const d = data.daily;
  const isDay = c.is_day === 1;

  // ---- Hero ----
  els.cityName.textContent = state.currentLocation.name;
  els.countryName.textContent = state.currentLocation.country;
  els.currentTemp.textContent = Math.round(c.temperature_2m);

  const wmo = WMO_CODES[c.weather_code] || WMO_CODES[0];
  els.weatherCondition.textContent = wmo.desc;
  els.feelsLike.innerHTML = `Feels like <strong>${Math.round(c.apparent_temperature)}°C</strong>`;

  // Draw weather icon on canvas
  drawWeatherIcon(els.weatherCanvas, c.weather_code, isDay);

  // Time updates
  startTimeUpdate(data.timezone);

  // ---- Metrics ----
  els.humidityVal.textContent = `${c.relative_humidity_2m}%`;
  els.humidityBar.style.width = `${c.relative_humidity_2m}%`;

  els.windVal.textContent = `${c.wind_speed_10m} km/h`;
  els.windDir.textContent = degToCompass(c.wind_direction_10m);

  els.uvVal.textContent = c.uv_index.toFixed(1);
  els.uvBadge.textContent = uvLabel(c.uv_index);
  els.uvBadge.style.background = uvColor(c.uv_index).bg;
  els.uvBadge.style.color = uvColor(c.uv_index).text;

  els.pressureVal.textContent = Math.round(c.pressure_msl);
  els.visibilityVal.textContent = `${(c.visibility / 1000).toFixed(1)} km`;
  els.precipVal.textContent = `${c.precipitation} mm`;

  // Sunrise / Sunset
  if (d.sunrise && d.sunrise[0]) {
    els.sunriseVal.textContent = formatTime(d.sunrise[0]);
  }
  if (d.sunset && d.sunset[0]) {
    els.sunsetVal.textContent = formatTime(d.sunset[0]);
  }

  // ---- Hourly Forecast (next 24h) ----
  renderHourly(h, data.timezone);

  // ---- Daily Forecast ----
  renderDaily(d);

  // ---- Footer ----
  els.lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  showWeather();
}

// ---- Hourly rendering ----
function renderHourly(h, tz) {
  const now = new Date();
  // Find current hour index
  let startIdx = 0;
  for (let i = 0; i < h.time.length; i++) {
    const hDate = new Date(h.time[i]);
    if (hDate >= now) { startIdx = Math.max(0, i - 1); break; }
  }

  const items = [];
  const count = Math.min(24, h.time.length - startIdx);

  for (let i = 0; i < count; i++) {
    const idx = startIdx + i;
    const dt = new Date(h.time[idx]);
    const isCurrent = i === 0;
    const isDay = h.is_day[idx] === 1;
    const wmo = WMO_CODES[h.weather_code[idx]] || WMO_CODES[0];
    const icon = isDay ? wmo.icon : wmo.night;
    const precip = h.precipitation_probability[idx];

    items.push(`
      <div class="hourly-item${isCurrent ? ' current-hour' : ''}" role="listitem">
        <span class="hourly-time">${isCurrent ? 'Now' : formatHour(dt)}</span>
        <div class="hourly-icon-container">${icon}</div>
        <span class="hourly-temp">${Math.round(h.temperature_2m[idx])}°</span>
        ${precip > 0 ? `<span class="hourly-precip">${precip}%</span>` : ''}
      </div>
    `);
  }

  els.hourlyList.innerHTML = items.join('');
}

// ---- Daily rendering ----
function renderDaily(d) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const allMin = Math.min(...d.temperature_2m_min);
  const allMax = Math.max(...d.temperature_2m_max);
  const range = allMax - allMin || 1;

  const items = [];
  for (let i = 0; i < d.time.length; i++) {
    const dt = new Date(d.time[i] + 'T00:00:00');
    const isToday = i === 0;
    const wmo = WMO_CODES[d.weather_code[i]] || WMO_CODES[0];

    // Compute bar position within the total range
    const lo = d.temperature_2m_min[i];
    const hi = d.temperature_2m_max[i];
    const left = ((lo - allMin) / range) * 100;
    const width = ((hi - lo) / range) * 100;

    items.push(`
      <div class="daily-item${isToday ? ' today' : ''}" role="listitem"
           style="animation-delay: ${i * 40}ms">
        <span class="daily-day">${isToday ? days[dt.getDay()] : days[dt.getDay()]}</span>
        <div class="daily-icon-container">${wmo.icon}</div>
        <span class="daily-condition">${wmo.desc}</span>
        <div class="daily-temps">
          <span class="daily-low">${Math.round(lo)}°</span>
          <div class="daily-bar-wrap">
            <div class="daily-bar-fill" style="margin-left:${left}%;width:${Math.max(width, 6)}%"></div>
          </div>
          <span class="daily-high">${Math.round(hi)}°</span>
        </div>
      </div>
    `);
  }

  els.dailyList.innerHTML = items.join('');
}

// ============================================================
//  CANVAS WEATHER ICON (Premium refined icon)
// ============================================================
function drawWeatherIcon(canvas, code, isDay) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Determine what to draw
  const isClear = [0, 1].includes(code);
  const isPartly = [2].includes(code);
  const isCloudy = [3, 45, 48].includes(code);
  const isRain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(code);
  const isStorm = [95, 96, 99].includes(code);

  if (isClear && isDay) {
    drawSun(ctx, cx, cy, 44);
  } else if (isClear && !isDay) {
    drawMoon(ctx, cx, cy, 40);
  } else if (isPartly) {
    if (isDay) drawSun(ctx, cx - 12, cy - 12, 32);
    else drawMoon(ctx, cx - 12, cy - 12, 28);
    drawCloud(ctx, cx + 10, cy + 14, 1.2);
  } else if (isCloudy) {
    drawCloud(ctx, cx - 12, cy - 8, 1.3);
    drawCloud(ctx, cx + 16, cy + 12, 0.9);
  } else if (isRain) {
    drawCloud(ctx, cx, cy - 14, 1.3);
    drawRaindrops(ctx, cx, cy + 20);
  } else if (isSnow) {
    drawCloud(ctx, cx, cy - 14, 1.3);
    drawSnowflakes(ctx, cx, cy + 20);
  } else if (isStorm) {
    drawCloud(ctx, cx, cy - 14, 1.3);
    drawLightning(ctx, cx, cy + 8);
  } else {
    // Fallback
    if (isDay) drawSun(ctx, cx, cy, 44);
    else drawMoon(ctx, cx, cy, 40);
  }
}

function drawSun(ctx, cx, cy, r) {
  // Glow
  const grd = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.8);
  grd.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
  grd.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(cx - r * 2.5, cy - r * 2.5, r * 5, r * 5);

  // Sun body
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const sunGrd = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
  sunGrd.addColorStop(0, '#fbbf24');
  sunGrd.addColorStop(1, '#d97706');
  ctx.fillStyle = sunGrd;
  ctx.fill();

  // Rays
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(angle) * (r + 10);
    const y1 = cy + Math.sin(angle) * (r + 10);
    const x2 = cx + Math.cos(angle) * (r + 20);
    const y2 = cy + Math.sin(angle) * (r + 20);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function drawMoon(ctx, cx, cy, r) {
  // Glow
  const grd = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.6);
  grd.addColorStop(0, 'rgba(148, 163, 184, 0.3)');
  grd.addColorStop(1, 'rgba(148, 163, 184, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(cx - r * 2.5, cy - r * 2.5, r * 5, r * 5);

  // Moon body
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const moonGrd = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
  moonGrd.addColorStop(0, '#e2e8f0');
  moonGrd.addColorStop(1, '#64748b');
  ctx.fillStyle = moonGrd;
  ctx.fill();

  // Crescent cutout
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx + r * 0.45, cy - r * 0.2, r * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

function drawCloud(ctx, cx, cy, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  
  // Cloud drop shadow for depth
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;
  
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(-22, 0, 20, 0, Math.PI * 2);
  ctx.arc(6, -12, 26, 0, Math.PI * 2);
  ctx.arc(32, 0, 18, 0, Math.PI * 2);
  ctx.arc(10, 10, 18, 0, Math.PI * 2);
  ctx.fill();
  
  // Highlight inner gradient
  ctx.shadowColor = 'transparent';
  ctx.globalCompositeOperation = 'source-atop';
  const cGrd = ctx.createLinearGradient(0, -30, 0, 30);
  cGrd.addColorStop(0, 'rgba(255,255,255,0.7)');
  cGrd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = cGrd;
  ctx.fillRect(-50, -50, 100, 100);
  
  ctx.restore();
}

function drawRaindrops(ctx, cx, cy) {
  ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
  const drops = [[-16, 0], [0, 8], [16, 2], [-8, 16], [8, 14]];
  for (const [dx, dy] of drops) {
    ctx.beginPath();
    ctx.ellipse(cx + dx, cy + dy, 2.5, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSnowflakes(ctx, cx, cy) {
  ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
  const flakes = [[-16, 0], [0, 8], [16, 2], [-8, 18], [8, 16]];
  for (const [dx, dy] of flakes) {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLightning(ctx, cx, cy) {
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - 10, cy + 18);
  ctx.lineTo(cx - 2, cy + 18);
  ctx.lineTo(cx - 8, cy + 34);
  ctx.lineTo(cx + 8, cy + 14);
  ctx.lineTo(cx + 1, cy + 14);
  ctx.lineTo(cx + 6, cy);
  ctx.closePath();
  ctx.fill();
}

// ============================================================
//  HELPER FUNCTIONS
// ============================================================
function degToCompass(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function uvLabel(uv) {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

function uvColor(uv) {
  if (uv <= 2) return { bg: 'rgba(34,197,94,0.15)', text: '#16a34a' };
  if (uv <= 5) return { bg: 'rgba(234,179,8,0.15)', text: '#ca8a04' };
  if (uv <= 7) return { bg: 'rgba(249,115,22,0.15)', text: '#ea580c' };
  if (uv <= 10) return { bg: 'rgba(239,68,68,0.15)', text: '#dc2626' };
  return { bg: 'rgba(168,85,247,0.15)', text: '#9333ea' };
}

function formatTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatHour(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\s/g, '');
}

// ---- Local time display ----
function startTimeUpdate(tz) {
  if (state.timeInterval) clearInterval(state.timeInterval);
  const update = () => {
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const dateStr = now.toLocaleDateString('en-US', {
        timeZone: tz,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      els.localTime.textContent = timeStr;
      els.localDate.textContent = dateStr;
    } catch {
      els.localTime.textContent = '';
      els.localDate.textContent = '';
    }
  };
  update();
  state.timeInterval = setInterval(update, 10000);
}

// ============================================================
//  UI STATE MANAGEMENT
// ============================================================
function showLoading() {
  els.skeleton.hidden = false;
  els.weatherContent.hidden = true;
  els.emptyState.hidden = true;
  els.errorState.hidden = true;
}

function showWeather() {
  els.skeleton.hidden = true;
  els.weatherContent.hidden = false;
  els.emptyState.hidden = true;
  els.errorState.hidden = true;
}

function showEmpty() {
  els.skeleton.hidden = true;
  els.weatherContent.hidden = true;
  els.emptyState.hidden = false;
  els.errorState.hidden = true;
}

function showError(msg) {
  els.skeleton.hidden = true;
  els.weatherContent.hidden = true;
  els.emptyState.hidden = true;
  els.errorState.hidden = false;
  els.errorMessage.textContent = msg || 'Could not fetch weather data.';
}

// ============================================================
//  SELECT A CITY
// ============================================================
function selectCity(name, country, lat, lon, tz) {
  state.currentLocation = { name, country, lat, lon, timezone: tz };
  els.searchInput.value = name;
  els.searchResults.innerHTML = '';
  els.searchClear.style.display = 'flex';
  // Save to localStorage
  localStorage.setItem('skycast-last-location', JSON.stringify(state.currentLocation));
  fetchWeather(lat, lon, tz);
}

// ============================================================
//  GEOLOCATION
// ============================================================
function geolocate() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }

  showLoading();
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      // Reverse geocode to get a city name
      try {
        const res = await fetch(`${API.geocoding}?name=_&count=1&language=en&format=json&latitude=${latitude}&longitude=${longitude}`);
        state.currentLocation = {
          name: 'My Location',
          country: '',
          lat: latitude,
          lon: longitude,
          timezone: 'auto',
        };
        localStorage.setItem('skycast-last-location', JSON.stringify(state.currentLocation));
        fetchWeather(latitude, longitude, 'auto');
      } catch {
        fetchWeather(latitude, longitude, 'auto');
      }
    },
    (err) => {
      console.error('Geolocation error:', err);
      showError('Could not access your location. Please search for a city instead.');
    },
    { timeout: 10000 }
  );
}

// ============================================================
//  EVENT LISTENERS
// ============================================================
function init() {
  // Theme
  initTheme();
  els.themeToggle.addEventListener('click', toggleTheme);

  // Geolocation
  els.locateBtn.addEventListener('click', geolocate);

  // Search input with debounce
  els.searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    els.searchClear.style.display = val ? 'flex' : 'none';
    clearTimeout(state.searchTimeout);
    state.searchTimeout = setTimeout(() => searchCities(val), 300);
  });

  els.searchInput.addEventListener('focus', () => {
    if (els.searchInput.value.trim().length >= 2) {
      searchCities(els.searchInput.value);
    }
  });

  // Clear button
  els.searchClear.addEventListener('click', () => {
    els.searchInput.value = '';
    els.searchResults.innerHTML = '';
    els.searchClear.style.display = 'none';
    els.searchInput.focus();
  });

  // Click on search result
  els.searchResults.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (!item || !item.dataset.lat) return;
    selectCity(
      item.dataset.name,
      item.dataset.country,
      parseFloat(item.dataset.lat),
      parseFloat(item.dataset.lon),
      item.dataset.tz
    );
  });

  // Keyboard navigation in search results
  els.searchInput.addEventListener('keydown', (e) => {
    const items = els.searchResults.querySelectorAll('.search-result-item[data-lat]');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.selectedResultIdx = Math.min(state.selectedResultIdx + 1, items.length - 1);
      updateSelectedResult(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      state.selectedResultIdx = Math.max(state.selectedResultIdx - 1, 0);
      updateSelectedResult(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (state.selectedResultIdx >= 0 && items[state.selectedResultIdx]) {
        items[state.selectedResultIdx].click();
      } else if (items.length > 0) {
        items[0].click();
      }
    } else if (e.key === 'Escape') {
      els.searchResults.innerHTML = '';
      state.selectedResultIdx = -1;
    }
  });

  // Close results on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      els.searchResults.innerHTML = '';
      state.selectedResultIdx = -1;
    }
  });

  // Popular city tags
  els.popularTags.addEventListener('click', (e) => {
    const tag = e.target.closest('.city-tag');
    if (!tag) return;
    const city = tag.dataset.city;
    els.searchInput.value = city;
    els.searchClear.style.display = 'flex';
    searchCities(city).then(() => {
      // Auto-select the first result after a short delay
      setTimeout(() => {
        const first = els.searchResults.querySelector('.search-result-item[data-lat]');
        if (first) first.click();
      }, 500);
    });
  });

  // Retry button
  els.errorRetry.addEventListener('click', () => {
    if (state.currentLocation) {
      fetchWeather(state.currentLocation.lat, state.currentLocation.lon, state.currentLocation.timezone);
    } else {
      showEmpty();
    }
  });

  // Restore last location
  const saved = localStorage.getItem('skycast-last-location');
  if (saved) {
    try {
      const loc = JSON.parse(saved);
      state.currentLocation = loc;
      els.searchInput.value = loc.name || '';
      els.searchClear.style.display = loc.name ? 'flex' : 'none';
      fetchWeather(loc.lat, loc.lon, loc.timezone);
    } catch {
      showEmpty();
    }
  } else {
    showEmpty();
  }
}

function updateSelectedResult(items) {
  items.forEach((item, i) => {
    item.setAttribute('aria-selected', i === state.selectedResultIdx ? 'true' : 'false');
  });
  if (items[state.selectedResultIdx]) {
    items[state.selectedResultIdx].scrollIntoView({ block: 'nearest' });
  }
}

// ---- Kick off ----
document.addEventListener('DOMContentLoaded', init);

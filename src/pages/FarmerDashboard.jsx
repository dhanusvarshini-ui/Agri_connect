import React, { useEffect, useMemo, useState } from "react";
import "../style.css";
import farmBg from "../assets/farm-bg.jpg";
import wheatImg from "../assets/wheat.png";

const STORAGE_KEYS = {
  profile: "agriconnect_farmer_profile_v1",
  dashboard: "agriconnect_farmer_dashboard_v1",
};

const WEATHER_CODE_LABEL = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Slight rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Slight snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

function safeJsonParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function formatDateLong(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function daysBetween(start, end) {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function severityFromValue({ tempC, windKmh, rainProb }) {
  if (typeof rainProb === "number" && rainProb >= 80) return "danger";
  if (typeof windKmh === "number" && windKmh >= 35) return "danger";
  if (typeof tempC === "number" && tempC >= 38) return "danger";
  if (typeof rainProb === "number" && rainProb >= 60) return "warning";
  if (typeof windKmh === "number" && windKmh >= 25) return "warning";
  if (typeof tempC === "number" && tempC >= 34) return "warning";
  return "info";
}

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" };
  switch (name) {
    case "home":
      return (
        <svg {...common} aria-hidden="true">
          <path
            d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "weather":
      return (
        <svg {...common} aria-hidden="true">
          <path
            d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A4 4 0 0 1 18 18H7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common} aria-hidden="true">
          <path
            d="M20 4c-9 1-15 7-16 16 9-1 15-7 16-16Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M4 20c3-6 8-10 16-16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "chart":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 20V4m0 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M7 16v-5m5 5V8m5 8v-3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "bell":
      return (
        <svg {...common} aria-hidden="true">
          <path
            d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2" />
          <path
            d="M19.4 15a8.9 8.9 0 0 0 .1-2l2-1.5-2-3.5-2.4.7a7.4 7.4 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1L4.5 8l-2 3.5 2 1.5a8.9 8.9 0 0 0 .1 2l-2 1.5 2 3.5 2.4-.7c.5.4 1.1.7 1.7 1l.4 2.5h4l.4-2.5c.6-.3 1.2-.6 1.7-1l2.4.7 2-3.5-2-1.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function Badge({ variant, children }) {
  return <span className={`fd-badge fd-badge--${variant}`}>{children}</span>;
}

function Stat({ label, value, sub }) {
  return (
    <div className="fd-stat">
      <div className="fd-stat__label">{label}</div>
      <div className="fd-stat__value">{value}</div>
      {sub ? <div className="fd-stat__sub">{sub}</div> : null}
    </div>
  );
}

function Card({ id, title, icon, right, children }) {
  return (
    <section className="fd-card" id={id}>
      <header className="fd-card__header">
        <div className="fd-card__title">
          {icon ? <span className="fd-card__icon">{icon}</span> : null}
          <h3>{title}</h3>
        </div>
        {right ? <div className="fd-card__right">{right}</div> : null}
      </header>
      <div className="fd-card__body">{children}</div>
    </section>
  );
}

const FarmerDashboard = () => {
  const [activeNav, setActiveNav] = useState("home");
  const [profile, setProfile] = useState(() => {
    const saved = safeJsonParse(localStorage.getItem(STORAGE_KEYS.profile), null);
    return (
      saved ?? {
        name: "Farmer",
        mobile: "",
        village: "Your Village",
        district: "Your District",
        latitude: 11.0168,
        longitude: 76.9558,
        soilType: "Loamy",
      }
    );
  });

  const [dashboard, setDashboard] = useState(() => {
    const saved = safeJsonParse(localStorage.getItem(STORAGE_KEYS.dashboard), null);
    return (
      saved ?? {
        soilMoisture: 62,
        soilPh: 6.8,
        cropName: "Wheat",
        sowingDate: new Date().toISOString().slice(0, 10),
        cropCycleDays: 110,
        quantityKg: 150,
        selectedPlotId: "A1",
        dismissedNotificationIds: [],
      }
    );
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [weatherState, setWeatherState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.dashboard, JSON.stringify(dashboard));
  }, [dashboard]);

  useEffect(() => {
    const latitude = clampNumber(profile.latitude, -90, 90, 0);
    const longitude = clampNumber(profile.longitude, -180, 180, 0);

    const controller = new AbortController();
    setWeatherState({ loading: true, error: null, data: null });

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(
        longitude
      )}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=precipitation_probability,precipitation&daily=temperature_2m_max,temperature_2m_min&forecast_days=2&timezone=auto`,
      { signal: controller.signal }
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(`Weather API error (${res.status})`);
        return res.json();
      })
      .then((json) => setWeatherState({ loading: false, error: null, data: json }))
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setWeatherState({ loading: false, error: err?.message || "Failed to load weather", data: null });
      });

    return () => controller.abort();
  }, [profile.latitude, profile.longitude]);

  const today = useMemo(() => new Date(), []);

  const weather = useMemo(() => {
    if (!weatherState.data) return null;
    const current = weatherState.data.current || {};
    const hourly = weatherState.data.hourly || {};

    const times = Array.isArray(hourly.time) ? hourly.time : [];
    const precipProb = Array.isArray(hourly.precipitation_probability) ? hourly.precipitation_probability : [];
    const precipMm = Array.isArray(hourly.precipitation) ? hourly.precipitation : [];

    const nowMs = Date.now();
    let nextIndex = -1;
    for (let i = 0; i < times.length; i += 1) {
      const t = Date.parse(times[i]);
      if (Number.isFinite(t) && t >= nowMs) {
        nextIndex = i;
        break;
      }
    }

    const horizon = nextIndex >= 0 ? Math.min(times.length, nextIndex + 6) : 0;
    const next6HourMaxProb =
      nextIndex >= 0
        ? precipProb
            .slice(nextIndex, horizon)
            .filter((v) => Number.isFinite(Number(v)))
            .reduce((m, v) => Math.max(m, Number(v)), 0)
        : null;

    const next6HourMm =
      nextIndex >= 0
        ? precipMm
            .slice(nextIndex, horizon)
            .filter((v) => Number.isFinite(Number(v)))
            .reduce((sum, v) => sum + Number(v), 0)
        : null;

    const daily = weatherState.data.daily || {};
    const tMax = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max[0] : null;
    const tMin = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min[0] : null;

    const code = current.weather_code ?? null;

    return {
      tempC: current.temperature_2m ?? null,
      humidityPct: current.relative_humidity_2m ?? null,
      windKmh: current.wind_speed_10m ?? null,
      weatherCode: code,
      condition: WEATHER_CODE_LABEL[code] || "Unknown",
      next6HourMaxRainProb: next6HourMaxProb,
      next6HourRainMm: next6HourMm,
      todayMaxC: tMax,
      todayMinC: tMin,
    };
  }, [weatherState.data]);

  const crop = useMemo(() => {
    const sowing = new Date(`${dashboard.sowingDate}T00:00:00`);
    const cycleDays = clampNumber(dashboard.cropCycleDays, 30, 240, 110);
    const day = daysBetween(sowing, new Date());
    const progress = Math.min(1, cycleDays > 0 ? day / cycleDays : 0);

    const harvest = new Date(sowing);
    harvest.setDate(harvest.getDate() + cycleDays);

    return {
      cropName: dashboard.cropName || "Crop",
      sowingDate: sowing,
      cropCycleDays: cycleDays,
      day,
      progress,
      harvestDate: harvest,
      quantityKg: clampNumber(dashboard.quantityKg, 0, 99999, 0),
    };
  }, [dashboard.cropCycleDays, dashboard.cropName, dashboard.quantityKg, dashboard.sowingDate]);

  const alerts = useMemo(() => {
    if (!weather) return [];
    const items = [];
    const severity = severityFromValue({ tempC: weather.tempC, windKmh: weather.windKmh, rainProb: weather.next6HourMaxRainProb });

    if (typeof weather.next6HourMaxRainProb === "number" && weather.next6HourMaxRainProb >= 60) {
      items.push({
        id: "rain-risk",
        title: "Rain likely soon",
        detail: `Rain probability up to ${Math.round(weather.next6HourMaxRainProb)}% in the next 6 hours.`,
        severity,
      });
    }

    if (typeof weather.windKmh === "number" && weather.windKmh >= 25) {
      items.push({
        id: "wind-risk",
        title: "High wind advisory",
        detail: `Wind speed ${Math.round(weather.windKmh)} km/h - avoid spraying today.`,
        severity,
      });
    }

    if (typeof weather.tempC === "number" && weather.tempC >= 34) {
      items.push({
        id: "heat-risk",
        title: "Heat stress risk",
        detail: `Temperature ${Math.round(weather.tempC)}°C - consider irrigation early morning/evening.`,
        severity,
      });
    }

    if (typeof weather.humidityPct === "number" && weather.humidityPct >= 85) {
      items.push({
        id: "humidity-risk",
        title: "High humidity",
        detail: `Humidity ${Math.round(weather.humidityPct)}% - increased fungal disease risk.`,
        severity: "warning",
      });
    }

    if (items.length === 0) {
      items.push({ id: "no-alerts", title: "All clear", detail: "No high-risk weather alerts detected right now.", severity: "success" });
    }

    return items;
  }, [weather]);

  const pestAndDisease = useMemo(() => {
    const items = [];
    const moisture = clampNumber(dashboard.soilMoisture, 0, 100, 0);
    const humidity = weather?.humidityPct ?? null;
    const temp = weather?.tempC ?? null;

    if (typeof humidity === "number" && humidity >= 80 && typeof temp === "number" && temp >= 18 && temp <= 30) {
      items.push({
        id: "fungal",
        title: "Fungal disease risk",
        detail: "High humidity conditions - monitor leaf spots and apply preventive measures.",
        severity: "warning",
      });
    }

    if (typeof temp === "number" && temp >= 30 && moisture <= 45) {
      items.push({
        id: "mites",
        title: "Mite risk (dry + hot)",
        detail: "Dry and warm conditions - inspect undersides of leaves; maintain irrigation schedule.",
        severity: "info",
      });
    }

    if (items.length === 0) {
      items.push({ id: "pest-ok", title: "No nearby alerts", detail: "No critical pest/disease signals based on current conditions.", severity: "success" });
    }

    return items;
  }, [dashboard.soilMoisture, weather?.humidityPct, weather?.tempC]);

  const smartAdvice = useMemo(() => {
    const advice = [];
    const moisture = clampNumber(dashboard.soilMoisture, 0, 100, 0);
    const rainProb = weather?.next6HourMaxRainProb ?? null;
    const wind = weather?.windKmh ?? null;

    if (typeof rainProb === "number" && rainProb >= 60) advice.push("Delay irrigation and fertilizer application - rain likely soon.");
    else if (moisture <= 40) advice.push("Soil is dry - irrigate early morning or evening for best water efficiency.");
    else advice.push("Soil moisture is in a healthy range - maintain current irrigation schedule.");

    if (typeof wind === "number" && wind >= 25) advice.push("Avoid pesticide spraying today due to wind drift risk.");
    else advice.push("Spraying window looks acceptable - prefer morning hours for better coverage.");

    if (crop.progress >= 0.85) advice.push("Harvest planning: prepare labor & storage - crop is nearing readiness.");
    else if (crop.progress >= 0.35) advice.push("Mid-cycle: focus on nutrient balance and pest monitoring for stable growth.");
    else advice.push("Early stage: ensure consistent moisture and avoid over-fertilizing.");

    return advice;
  }, [crop.progress, dashboard.soilMoisture, weather?.next6HourMaxRainProb, weather?.windKmh]);

  const plots = useMemo(
    () => [
      { id: "A1", label: "Plot A1", status: "Ready to sow" },
      { id: "A2", label: "Plot A2", status: "Growing" },
      { id: "A3", label: "Plot A3", status: "Irrigated" },
      { id: "B1", label: "Plot B1", status: "Fallow" },
      { id: "B2", label: "Plot B2", status: "Growing" },
      { id: "B3", label: "Plot B3", status: "Harvest soon" },
    ],
    []
  );

  const notifications = useMemo(() => {
    const list = [];

    for (const a of alerts) {
      if (a.id === "no-alerts") continue;
      list.push({ id: `alert:${a.id}`, title: a.title, detail: a.detail, severity: a.severity });
    }

    const daysToHarvest = Math.max(0, crop.cropCycleDays - crop.day);
    if (daysToHarvest <= 7) {
      list.push({
        id: "reminder:harvest",
        title: "Harvest reminder",
        detail: `Expected harvest in ${daysToHarvest} day(s).`,
        severity: daysToHarvest <= 3 ? "warning" : "info",
      });
    }

    if (clampNumber(dashboard.soilMoisture, 0, 100, 0) <= 35) {
      list.push({
        id: "reminder:irrigation",
        title: "Irrigation reminder",
        detail: "Soil moisture is low - schedule irrigation.",
        severity: "warning",
      });
    }

    return list.filter((n) => !dashboard.dismissedNotificationIds.includes(n.id));
  }, [alerts, crop.cropCycleDays, crop.day, dashboard.dismissedNotificationIds, dashboard.soilMoisture]);

  const sellingStatus = useMemo(() => {
    const readiness = Math.round(crop.progress * 100);
    if (readiness >= 95) return { label: "Ready to harvest", variant: "success" };
    if (readiness >= 80) return { label: "Harvest window soon", variant: "warning" };
    if (readiness >= 40) return { label: "Growing (on track)", variant: "info" };
    return { label: "Early stage", variant: "info" };
  }, [crop.progress]);

  const goTo = (section) => {
    setActiveNav(section);
    const el = document.getElementById(`fd-${section}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="pro-dashboard fd">
      <aside className="sidebar fd-sidebar" aria-label="Dashboard navigation">
        <div className="fd-brand">
          <div className="fd-brand__logo">AC</div>
          <div className="fd-brand__name">AgriConnect</div>
        </div>

        <nav className="fd-nav">
          <button
            className={`fd-nav__btn ${activeNav === "home" ? "is-active" : ""}`}
            onClick={() => goTo("home")}
            title="Overview"
            type="button"
          >
            <Icon name="home" />
          </button>
          <button
            className={`fd-nav__btn ${activeNav === "weather" ? "is-active" : ""}`}
            onClick={() => goTo("weather")}
            title="Weather"
            type="button"
          >
            <Icon name="weather" />
          </button>
          <button
            className={`fd-nav__btn ${activeNav === "alerts" ? "is-active" : ""}`}
            onClick={() => goTo("alerts")}
            title="Alerts"
            type="button"
          >
            <Icon name="bell" />
          </button>
          <button
            className={`fd-nav__btn ${activeNav === "fields" ? "is-active" : ""}`}
            onClick={() => goTo("fields")}
            title="Fields"
            type="button"
          >
            <Icon name="leaf" />
          </button>
          <button
            className={`fd-nav__btn ${activeNav === "notifications" ? "is-active" : ""}`}
            onClick={() => goTo("notifications")}
            title="Notifications"
            type="button"
          >
            <Icon name="bell" />
            {notifications.length ? (
              <span className="fd-nav__badge" aria-label={`${notifications.length} notifications`}>
                {Math.min(99, notifications.length)}
              </span>
            ) : null}
          </button>
          <button
            className={`fd-nav__btn ${activeNav === "settings" ? "is-active" : ""}`}
            onClick={() => setIsEditingProfile(true)}
            title="Profile settings"
            type="button"
          >
            <Icon name="settings" />
          </button>
        </nav>

        <div className="fd-sidebar__foot">
          <div className="fd-status">
            <span className="fd-dot fd-dot--online" />
            <span>Logged in</span>
          </div>
        </div>
      </aside>

      <main className="main-area fd-main">
        <section className="fd-hero" style={{ backgroundImage: `url(${farmBg})` }}>
          <div className="fd-hero__overlay" />
          <div className="fd-hero__content">
            <div className="fd-hero__left">
              <div className="fd-hero__kicker">Decision Support Dashboard</div>
              <h1 className="fd-hero__title">Welcome, {profile.name}</h1>
              <p className="fd-hero__subtitle">
                Live weather, crop tracking, pest alerts, and smart advice to help you take the right action at the right
                time.
              </p>
              <div className="fd-hero__meta">
                <Badge variant="dark">
                  {profile.village}, {profile.district}
                </Badge>
                <Badge variant="dark">{profile.mobile ? `+91 ${profile.mobile}` : "Mobile not set"}</Badge>
                <Badge variant="dark">{formatDateLong(today)}</Badge>
              </div>
            </div>

            <div className="fd-hero__right">
              <div className="fd-hero__miniCard">
                <div className="fd-miniTitle">Live Weather</div>
                {weatherState.loading ? (
                  <div className="fd-miniValue">Loading...</div>
                ) : weatherState.error ? (
                  <div className="fd-miniValue fd-text--danger">{weatherState.error}</div>
                ) : weather ? (
                  <>
                    <div className="fd-miniValue">
                      {Math.round(weather.tempC)}°C <span className="fd-miniSub">{weather.condition}</span>
                    </div>
                    <div className="fd-miniRow">
                      <span>Wind: {Math.round(weather.windKmh)} km/h</span>
                      <span>Humidity: {Math.round(weather.humidityPct)}%</span>
                    </div>
                    <div className="fd-miniRow">
                      <span>Rain (6h): {weather.next6HourMaxRainProb ?? "-"}%</span>
                      <span>Est. mm: {weather.next6HourRainMm ? weather.next6HourRainMm.toFixed(1) : "-"}</span>
                    </div>
                  </>
                ) : (
                  <div className="fd-miniValue">-</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="fd-grid">
          <Card
            id="fd-home"
            title="Farmer Identity & Session Info"
            icon={<Icon name="home" />}
            right={
              <button className="fd-linkBtn" type="button" onClick={() => setIsEditingProfile(true)}>
                Edit profile
              </button>
            }
          >
            <div className="fd-row">
              <Stat label="Farmer" value={profile.name} sub="Trust + personalization" />
              <Stat
                label="Location"
                value={`${profile.village}, ${profile.district}`}
                sub="Used for weather + advisories"
              />
              <Stat label="Logged-in status" value="Active" sub="This is your dashboard" />
            </div>
            <div className="fd-row fd-row--compact">
              <Badge variant="soft">Latitude: {Number(profile.latitude).toFixed(4)}</Badge>
              <Badge variant="soft">Longitude: {Number(profile.longitude).toFixed(4)}</Badge>
              <Badge variant="soft">Soil type: {profile.soilType}</Badge>
            </div>
          </Card>

          <Card
            id="fd-weather"
            title="Live Weather Information (Open-Meteo)"
            icon={<Icon name="weather" />}
            right={
              weather ? (
                <Badge
                  variant={severityFromValue({
                    tempC: weather.tempC,
                    windKmh: weather.windKmh,
                    rainProb: weather.next6HourMaxRainProb,
                  })}
                >
                  {weather.condition}
                </Badge>
              ) : null
            }
          >
            {weatherState.loading ? (
              <div className="fd-muted">Loading live weather...</div>
            ) : weatherState.error ? (
              <div className="fd-callout fd-callout--danger">
                <div className="fd-callout__title">Weather unavailable</div>
                <div className="fd-callout__text">
                  Check internet connection and verify latitude/longitude in profile.
                </div>
              </div>
            ) : weather ? (
              <div className="fd-row">
                <Stat
                  label="Temperature"
                  value={`${Math.round(weather.tempC)}°C`}
                  sub={`Today: ${Math.round(weather.todayMinC)}°C - ${Math.round(weather.todayMaxC)}°C`}
                />
                <Stat label="Condition" value={weather.condition} sub={`Code: ${weather.weatherCode ?? "-"}`} />
                <Stat label="Wind speed" value={`${Math.round(weather.windKmh)} km/h`} sub="10m height" />
                <Stat label="Humidity" value={`${Math.round(weather.humidityPct)}%`} sub="Relative humidity" />
              </div>
            ) : (
              <div className="fd-muted">No weather data yet.</div>
            )}
          </Card>

          <Card id="fd-alerts" title="Weather Alerts & Warnings" icon={<Icon name="bell" />}>
            <div className="fd-list">
              {alerts.map((a) => (
                <div className={`fd-listItem fd-listItem--${a.severity}`} key={a.id}>
                  <div className="fd-listItem__head">
                    <span className="fd-listItem__title">{a.title}</span>
                    <Badge variant={a.severity}>{a.severity.toUpperCase()}</Badge>
                  </div>
                  <div className="fd-listItem__text">{a.detail}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card id="fd-soil" title="Soil & Field Condition" icon={<Icon name="leaf" />}>
            <div className="fd-row">
              <div className="fd-formStat">
                <div className="fd-formStat__label">Soil moisture</div>
                <div className="fd-formStat__value">{dashboard.soilMoisture}%</div>
                <input
                  className="fd-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={dashboard.soilMoisture}
                  onChange={(e) =>
                    setDashboard((d) => ({
                      ...d,
                      soilMoisture: clampNumber(e.target.value, 0, 100, d.soilMoisture),
                    }))
                  }
                />
                <div className="fd-muted">Manual/simulated for now (future: IoT sensor integration).</div>
              </div>

              <div className="fd-formStat">
                <div className="fd-formStat__label">Soil pH (optional)</div>
                <div className="fd-formStat__value">{Number(dashboard.soilPh).toFixed(1)}</div>
                <input
                  className="fd-input"
                  type="number"
                  step="0.1"
                  min="3.5"
                  max="9.5"
                  value={dashboard.soilPh}
                  onChange={(e) =>
                    setDashboard((d) => ({
                      ...d,
                      soilPh: clampNumber(e.target.value, 3.5, 9.5, d.soilPh),
                    }))
                  }
                />
                <div className="fd-muted">Helpful later for crop suitability suggestions.</div>
              </div>
            </div>
          </Card>

          <Card id="fd-crop" title="Crop Status & Growth Tracker" icon={<Icon name="chart" />}>
            <div className="fd-row fd-row--tight">
              <div className="fd-formGrid">
                <label className="fd-label">
                  Crop name
                  <input
                    className="fd-input"
                    value={dashboard.cropName}
                    onChange={(e) => setDashboard((d) => ({ ...d, cropName: e.target.value }))}
                    placeholder="e.g., Tomato"
                  />
                </label>
                <label className="fd-label">
                  Sowing date
                  <input
                    className="fd-input"
                    type="date"
                    value={dashboard.sowingDate}
                    onChange={(e) => setDashboard((d) => ({ ...d, sowingDate: e.target.value }))}
                  />
                </label>
                <label className="fd-label">
                  Cycle (days)
                  <input
                    className="fd-input"
                    type="number"
                    min="30"
                    max="240"
                    value={dashboard.cropCycleDays}
                    onChange={(e) =>
                      setDashboard((d) => ({
                        ...d,
                        cropCycleDays: clampNumber(e.target.value, 30, 240, d.cropCycleDays),
                      }))
                    }
                  />
                </label>
              </div>

              <div className="fd-progressWrap">
                <div className="fd-progressTop">
                  <div>
                    <div className="fd-progressTitle">{crop.cropName}</div>
                    <div className="fd-muted">
                      Day {crop.day} / {crop.cropCycleDays} - Harvest: {formatDateLong(crop.harvestDate)}
                    </div>
                  </div>
                  <Badge variant={sellingStatus.variant}>{Math.round(crop.progress * 100)}%</Badge>
                </div>
                <div
                  className="fd-progressBar"
                  role="progressbar"
                  aria-valuenow={Math.round(crop.progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="fd-progressBar__fill" style={{ width: `${Math.round(crop.progress * 100)}%` }} />
                </div>
              </div>
            </div>
          </Card>

          <Card id="fd-pests" title="Pest & Disease Alerts" icon={<Icon name="bell" />}>
            <div className="fd-list">
              {pestAndDisease.map((p) => (
                <div className={`fd-listItem fd-listItem--${p.severity}`} key={p.id}>
                  <div className="fd-listItem__head">
                    <span className="fd-listItem__title">{p.title}</span>
                    <Badge variant={p.severity}>{p.severity.toUpperCase()}</Badge>
                  </div>
                  <div className="fd-listItem__text">{p.detail}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card id="fd-advice" title="Smart Farming Advice" icon={<Icon name="leaf" />}>
            <ul className="fd-bullets">
              {smartAdvice.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
            <div className="fd-muted">
              Transparent logic: these are rule-based recommendations (easy to explain to judges).
            </div>
          </Card>

          <Card id="fd-fields" title="Field Management / Visualization" icon={<Icon name="leaf" />}>
            <div className="fd-fieldGrid" role="list">
              {plots.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`fd-plot ${dashboard.selectedPlotId === p.id ? "is-selected" : ""}`}
                  onClick={() => setDashboard((d) => ({ ...d, selectedPlotId: p.id }))}
                  role="listitem"
                >
                  <div className="fd-plot__id">{p.label}</div>
                  <div className="fd-plot__status">{p.status}</div>
                  <div className="fd-plot__meta">Tap to select</div>
                </button>
              ))}
            </div>
            <div className="fd-muted">Selected plot: {dashboard.selectedPlotId}</div>
          </Card>

          <Card
            id="fd-notifications"
            title="Notifications & Reminders"
            icon={<Icon name="bell" />}
            right={<Badge variant="soft">{notifications.length} active</Badge>}
          >
            {notifications.length ? (
              <div className="fd-list">
                {notifications.map((n) => (
                  <div className={`fd-listItem fd-listItem--${n.severity}`} key={n.id}>
                    <div className="fd-listItem__head">
                      <span className="fd-listItem__title">{n.title}</span>
                      <button
                        type="button"
                        className="fd-smallBtn"
                        onClick={() =>
                          setDashboard((d) => ({
                            ...d,
                            dismissedNotificationIds: [...d.dismissedNotificationIds, n.id],
                          }))
                        }
                      >
                        Mark done
                      </button>
                    </div>
                    <div className="fd-listItem__text">{n.detail}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="fd-muted">No notifications right now.</div>
            )}
          </Card>
        </div>
      </main>

      <aside className="crop-panel fd-right" aria-label="Crop and selling panel">
        <div className="fd-right__top">
          <img className="fd-right__img" src={wheatImg} alt="Crop illustration" />
          <div className="fd-right__title">{crop.cropName}</div>
          <div className="fd-right__sub">Selected plot: {dashboard.selectedPlotId}</div>
        </div>

        <div className="fd-right__section">
          <div className="fd-right__sectionHead">
            <div>Product Readiness / Selling Status</div>
            <Badge variant={sellingStatus.variant}>{sellingStatus.label}</Badge>
          </div>
          <div className="fd-right__kv">
            <div className="fd-right__kvKey">Expected harvest</div>
            <div className="fd-right__kvVal">{formatDateLong(crop.harvestDate)}</div>
          </div>
          <div className="fd-right__kv">
            <div className="fd-right__kvKey">Quantity available</div>
            <div className="fd-right__kvVal">
              <input
                className="fd-input fd-input--sm"
                type="number"
                min="0"
                value={dashboard.quantityKg}
                onChange={(e) =>
                  setDashboard((d) => ({
                    ...d,
                    quantityKg: clampNumber(e.target.value, 0, 99999, d.quantityKg),
                  }))
                }
              />
              <span className="fd-muted">kg</span>
            </div>
          </div>
          <div className="fd-muted">
            Bridge between farmer and consumer: shows readiness and quantity for transparency.
          </div>
        </div>

        <div className="fd-right__section">
          <div className="fd-right__sectionHead">Quick Actions</div>
          <button className="plant-btn fd-primaryBtn" type="button" onClick={() => goTo("fields")}>
            Open Field View
          </button>
          <button className="fd-secondaryBtn" type="button" onClick={() => goTo("weather")}>
            Check Weather
          </button>
          <button className="fd-secondaryBtn" type="button" onClick={() => goTo("notifications")}>
            View Notifications
          </button>
          <button className="fd-secondaryBtn" type="button" onClick={() => setIsEditingProfile(true)}>
            Edit Profile
          </button>
        </div>

        <div className="fd-right__section fd-right__hint">
          <div className="fd-right__sectionHead">Image Tip</div>
          <div className="fd-muted">
            Add your local banner by replacing <span className="fd-code">src/assets/farm-bg.jpg</span> (keep the same
            filename).
          </div>
        </div>
      </aside>

      {isEditingProfile ? (
        <div className="fd-modal" role="dialog" aria-modal="true" aria-label="Edit profile">
          <div className="fd-modal__overlay" onClick={() => setIsEditingProfile(false)} />
          <div className="fd-modal__card">
            <div className="fd-modal__head">
              <div className="fd-modal__title">Farmer Profile</div>
              <button className="fd-smallBtn" type="button" onClick={() => setIsEditingProfile(false)}>
                Close
              </button>
            </div>

            <div className="fd-modal__grid">
              <label className="fd-label">
                Name
                <input
                  className="fd-input"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                />
              </label>
              <label className="fd-label">
                Mobile
                <input
                  className="fd-input"
                  value={profile.mobile}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  placeholder="10-digit number"
                />
              </label>
              <label className="fd-label">
                Village
                <input
                  className="fd-input"
                  value={profile.village}
                  onChange={(e) => setProfile((p) => ({ ...p, village: e.target.value }))}
                />
              </label>
              <label className="fd-label">
                District
                <input
                  className="fd-input"
                  value={profile.district}
                  onChange={(e) => setProfile((p) => ({ ...p, district: e.target.value }))}
                />
              </label>
              <label className="fd-label">
                Latitude
                <input
                  className="fd-input"
                  type="number"
                  step="0.0001"
                  value={profile.latitude}
                  onChange={(e) => setProfile((p) => ({ ...p, latitude: e.target.value }))}
                />
              </label>
              <label className="fd-label">
                Longitude
                <input
                  className="fd-input"
                  type="number"
                  step="0.0001"
                  value={profile.longitude}
                  onChange={(e) => setProfile((p) => ({ ...p, longitude: e.target.value }))}
                />
              </label>
              <label className="fd-label">
                Soil type
                <select
                  className="fd-input"
                  value={profile.soilType}
                  onChange={(e) => setProfile((p) => ({ ...p, soilType: e.target.value }))}
                >
                  <option>Loamy</option>
                  <option>Clay</option>
                  <option>Sandy</option>
                  <option>Silty</option>
                  <option>Peaty</option>
                  <option>Chalky</option>
                </select>
              </label>
            </div>

            <div className="fd-modal__foot">
              <div className="fd-muted">Saved locally for now (future: backend authentication).</div>
              <button className="fd-primaryBtn" type="button" onClick={() => setIsEditingProfile(false)}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FarmerDashboard;

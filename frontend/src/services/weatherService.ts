// services/weatherService.ts

export interface WeatherData {
  _id?: string;
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  description: string;
  createdAt?: string;
}

interface OpenWeatherItem {
  name: string;
  sys: { country: string };
  main: { temp: number; humidity: number };
  weather: { description: string }[];
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

/* =========================================================
   FETCH WEATHER FROM OPENWEATHER (SEARCH)
========================================================= */
export async function fetchWeatherList(city: string): Promise<WeatherData[]> {
  if (!city) return [];

  const url = `https://api.openweathermap.org/data/2.5/find?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${OPENWEATHER_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch weather data.");
  }

  const data = await res.json();
  const items: OpenWeatherItem[] = data.list ?? [];

  return items
    .filter(
      (item) =>
        item.name && item.sys?.country && item.main && item.weather?.length
    )
    .map((item) => ({
      city: item.name,
      country: item.sys.country,
      temperature: item.main.temp,
      humidity: item.main.humidity,
      description: item.weather[0]?.description ?? "",
      createdAt: new Date().toISOString(),
    }));
}

/* =========================================================
   SAVE WEATHER RESULT (POST)
========================================================= */
export async function saveWeatherResult(data: WeatherData): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to save weather data.");
  }
}

/* =========================================================
   GET SAVED WEATHER RESULTS
========================================================= */
export async function getSavedWeather(): Promise<WeatherData[]> {
  const res = await fetch(BASE_URL, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch saved weather data.");
  }

  return res.json();
}

/* =========================================================
   DELETE SAVED WEATHER RESULT
========================================================= */
export async function deleteSavedWeather(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete saved weather data.");
  }
}

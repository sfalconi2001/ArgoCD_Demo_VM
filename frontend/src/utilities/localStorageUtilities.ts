import { WeatherData } from "@/services/weatherService";

const STORAGE_KEY = "savedWeathers";

export function saveWeathersToLocalStorage(data: WeatherData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getWeathersFromLocalStorage(): WeatherData[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

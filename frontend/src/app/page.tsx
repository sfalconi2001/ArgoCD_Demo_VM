"use client";

import Image from "next/image";
import { useReducer, useState, useCallback } from "react";
import { weatherReducer } from "@/reducers/weatherReducer";
import { WeatherData, saveWeatherResult } from "@/services/weatherService";
import { handleSearch } from "@/utilities/formUtilities";
import {
  getWeathersFromLocalStorage,
  saveWeathersToLocalStorage,
} from "@/utilities/localStorageUtilities";
import WeatherForm from "@/components/WeatherForm";
import WeatherList from "@/components/WeatherList";

export default function Home() {
  const [state, dispatch] = useReducer(weatherReducer, {
    weather: [],
    loading: false,
    error: "",
    selected: new Set<string>(), // ya NO se usa aquí, pero no rompe nada
    savedWeathers: getWeathersFromLocalStorage(),
  });

  // ✅ ESTA es la única fuente de verdad para el save
  const [selectedWeather, setSelectedWeather] = useState<WeatherData[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const search = handleSearch(dispatch);

  // ✅ WeatherList nos entrega los objetos seleccionados directamente
  const handleSelectionChange = useCallback((selected: WeatherData[]) => {
    setSelectedWeather(selected);
  }, []);

  // ✅ Guardado REAL (ya no llega vacío)
  const saveSelectedWeather = async () => {
    if (selectedWeather.length === 0) return;

    try {
      await Promise.all(
        selectedWeather.map((weather) => saveWeatherResult(weather))
      );

      setNotification("Weather data saved!");

      const updatedSaved = [...state.savedWeathers, ...selectedWeather];
      dispatch({ type: "SET_SAVED_WEATHERS", payload: updatedSaved });
      saveWeathersToLocalStorage(updatedSaved);

      // Limpieza visual
      setSelectedWeather([]);
    } catch (error) {
      console.error(error);
      setNotification("Error saving weather data");
    }
  };

  return (
    <main className="flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto">
      {/* Logo */}
      <Image
        src="/weatherlyLogo.png"
        alt="Weatherly Logo"
        width={400}
        height={100}
        priority
      />

      {/* Formulario */}
      <WeatherForm
        onSearch={search}
        dispatch={dispatch}
        onSaveSelected={saveSelectedWeather}
        showSavedButton={true}
      />

      {/* Notificación */}
      {notification && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow">
          {notification}
        </div>
      )}

      {/* Estado */}
      {state.loading && <p>Loading the weather data...</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}
      {!state.loading && !state.error && state.weather.length === 0 && (
        <p>No results were found.</p>
      )}

      {/* Lista */}
      {state.weather.length > 0 && (
        <WeatherList
          weather={state.weather}
          onSelectionChange={handleSelectionChange}
        />
      )}
    </main>
  );
}

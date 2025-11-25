"use client";

import Image from "next/image";
import { useReducer, useState, useEffect, useCallback } from "react";
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
    selected: new Set<string>(),
    savedWeathers: getWeathersFromLocalStorage(),
  });

  // Array de objetos seleccionados
  const [selectedWeather, setSelectedWeather] = useState<WeatherData[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const search = handleSearch(dispatch);

  // Sincronizar selectedWeather con state.selected
  useEffect(() => {
    const selectedIds = state.selected;
    const selectedData = state.weather.filter(
      (w) => w._id && selectedIds.has(w._id)
    );
    setSelectedWeather(selectedData);
  }, [state.selected, state.weather]);

  const saveSelectedWeather = async () => {
    if (selectedWeather.length === 0) return;

    try {
      await Promise.all(selectedWeather.map((w) => saveWeatherResult(w)));
      setNotification("Weather data saved!");

      const updatedSaved = [...state.savedWeathers, ...selectedWeather];
      dispatch({ type: "SET_SAVED_WEATHERS", payload: updatedSaved });
      saveWeathersToLocalStorage(updatedSaved);

      // Limpiar selección
      dispatch({ type: "CLEAR_SELECTION" });
    } catch (err) {
      setNotification("Error saving weather data");
      console.error(err);
    }
  };

  const handleSelectionChange = useCallback((selected: WeatherData[]) => {
    // Limpiamos la selección anterior
    dispatch({ type: "CLEAR_SELECTION" });

    // Activamos los seleccionados
    selected.forEach((w) => {
      if (w._id) dispatch({ type: "TOGGLE_SELECT", payload: w._id });
    });
  }, []);

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
      {state.loading && <p>Loading weather data...</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}
      {!state.loading && !state.error && state.weather.length === 0 && (
        <p>No results found.</p>
      )}

      {/* Lista de resultados */}
      {state.weather.length > 0 && (
        <WeatherList
          weather={state.weather}
          onSelectionChange={handleSelectionChange}
        />
      )}
    </main>
  );
}

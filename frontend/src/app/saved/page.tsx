"use client";

import Image from "next/image";
import { useReducer, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import WeatherForm from "@/components/WeatherForm";
import WeatherList from "@/components/WeatherList";
import { weatherReducer } from "@/reducers/weatherReducer";
import { WeatherData, saveWeatherResult } from "@/services/weatherService";
import { handleSearch } from "@/utilities/formUtilities";

const initialState = {
  weather: [],
  loading: false,
  error: "",
  selected: new Set<string>(),
  savedWeathers: [],
};

type WeatherStatusProps = {
  loading: boolean;
  error: string;
  hasResults: boolean;
};

type Notification = {
  message: string;
  type: "success" | "error";
};

function WeatherStatus({ loading, error, hasResults }: WeatherStatusProps) {
  if (loading)
    return <p className="loading-message">Loading weather data...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!loading && !error && !hasResults)
    return <p className="loading-message">No results found.</p>;
  return null;
}

function NotificationBox({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const bg =
    notification.type === "success"
      ? "bg-green-600 text-white"
      : "bg-red-600 text-white";

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg ${bg}`}
        >
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [state, dispatch] = useReducer(weatherReducer, initialState);
  const [selectedWeather, setSelectedWeather] = useState<WeatherData[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);

  const search = handleSearch(dispatch);

  const saveSelectedWeather = async () => {
    if (selectedWeather.length === 0) return;

    try {
      await Promise.all(selectedWeather.map((w) => saveWeatherResult(w)));
      setNotification({ message: "Weather data saved!", type: "success" });
      setSelectedWeather([]);
    } catch (error) {
      setNotification({
        message: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    }
  };

  const handleSelectionChange = useCallback((selected: WeatherData[]) => {
    setSelectedWeather(selected);
  }, []);

  return (
    <main className="flex flex-col items-center gap-8 p-6 max-w-2xl mx-auto">
      {/* Logo */}
      <div className="logo-container">
        <Image
          src="/weatherlyLogo.png"
          alt="Weatherly Logo"
          width={400}
          height={100}
          priority
        />
      </div>

      {/* Form */}
      <WeatherForm
        onSearch={search}
        dispatch={dispatch}
        onSaveSelected={saveSelectedWeather}
        showSavedButton={true}
      />

      {/* Notification */}
      {notification && (
        <NotificationBox
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Status */}
      <WeatherStatus
        loading={state.loading}
        error={state.error}
        hasResults={state.weather.length > 0}
      />

      {/* Results */}
      {state.weather.length > 0 && (
        <WeatherList
          weather={state.weather}
          onSelectionChange={handleSelectionChange}
        />
      )}
    </main>
  );
}

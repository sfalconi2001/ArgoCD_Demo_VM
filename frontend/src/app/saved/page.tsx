"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  WeatherData,
  getSavedWeather,
  deleteSavedWeather,
} from "@/services/weatherService";

export default function SavedPage() {
  const [savedWeather, setSavedWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  /* =========================================================
     FETCH SAVED WEATHER
  ========================================================= */
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoading(true);
        const data = await getSavedWeather();
        setSavedWeather(data);
      } catch (err) {
        console.error(err);
        setError("Error loading saved weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  /* =========================================================
     DELETE WEATHER
  ========================================================= */
  const handleDelete = async (id?: string) => {
    if (!id) return;

    try {
      await deleteSavedWeather(id);
      setSavedWeather((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting the weather result.");
    }
  };

  const filteredWeather = savedWeather.filter((item) =>
    item.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* =========================================================
     UI
  ========================================================= */
  return (
    <main className="saved-page-container">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by city..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {/* Title */}
      <h1 className="saved-title">Saved Results</h1>

      {/* Status */}
      {loading && <p className="loading-message">Loading saved data...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && filteredWeather.length === 0 && (
        <p className="loading-message">No saved results found.</p>
      )}

      {/* Saved List */}
      <section className="saved-list">
        <AnimatePresence>
          {filteredWeather.map((item) => (
            <motion.article
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="saved-card"
            >
              <div className="saved-details">
                <h2>
                  {item.city}, {item.country}
                </h2>

                <p>🌡 Temperature: {item.temperature}°C</p>
                <p>💧 Humidity: {item.humidity}%</p>
                <p>☁ Weather: {item.description}</p>

                {item.createdAt && (
                  <p className="saved-timestamp">
                    Saved on: {new Date(item.createdAt).toLocaleString()}
                  </p>
                )}
              </div>

              <button
                className="delete-button"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </motion.article>
          ))}
        </AnimatePresence>
      </section>
    </main>
  );
}

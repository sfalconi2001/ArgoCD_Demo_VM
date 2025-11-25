import { MutableRefObject } from "react";
import { WeatherAction } from "@/reducers/weatherReducer";
import { fetchWeatherList } from "@/services/weatherService";

export function handleClear(
  e: React.MouseEvent<HTMLButtonElement>,
  setCity: (val: string) => void,
  inputRef: MutableRefObject<HTMLInputElement | null>,
  dispatch: React.Dispatch<WeatherAction>
) {
  e.preventDefault();
  setCity("");
  inputRef.current?.focus();
  dispatch({ type: "CLEAR_WEATHER" });
}

export const handleSearch =
  (dispatch: React.Dispatch<WeatherAction>) => async (city: string) => {
    if (!city.trim()) return;

    dispatch({ type: "FETCH_START" });

    try {
      const data = await fetchWeatherList(city);
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (error) {
      dispatch({
        type: "FETCH_FAILURE",
        payload: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

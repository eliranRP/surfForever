
import { apiClient } from "../framework/api-manager";
import logger from "../framework/logger.manager";
import {
  WaveHeightResponse,
  RatingResponse,
  SearchResult,
  SpotDetail,
  Forecast,
} from "./types";



export const searchForPlace = async (
  query: string
): Promise<SearchResult[]> => {
  return await apiClient
    .get(
      `${process.env.SURFLINE_BASE_URL}/search/site?q=${query}&querySize=10&suggestionSize=10&newsSearch=true`
    )
    .catch((error) => {
      logger.error(error);
      throw error;
    });
};

export const getWave = async (
  spotId: string,
  days: number = 2,
  intervalHours: number = 6
): Promise<WaveHeightResponse> => {
  const response = await apiClient
    .get(
      `${process.env.SURFLINE_BASE_URL}/spots/forecasts/wave?spotId=${spotId}&days=${days}&intervalHours=${intervalHours}&cacheEnabled=true&units%5BswellHeight%5D=M&units%5BwaveHeight%5D=M`
    )
    .catch((error) => {
      logger.error(error);
      throw error;
    });
  return response.data;
};

export const spotDetails = async (spotId: string): Promise<SpotDetail> => {
  return await apiClient
    .get(`${process.env.SURFLINE_BASE_URL}/spots/details?spotId=${spotId}`)
    .catch((error) => {
      logger.error(error);
      throw error;
    });
};

export const getRating = async (
  spotId: string,
  days: number = 2,
  intervalHours: number = 1
): Promise<RatingResponse> => {
  const response = await apiClient.get(
    `${process.env.SURFLINE_BASE_URL}/spots/forecasts/rating?spotId=${spotId}&days=${days}&intervalHours=${intervalHours}&cacheEnabled=true`
  );
  return response;
};

export const getForecast = async (
  spotId: string,
  days: number = 2
): Promise<Forecast[]> => {
  const [waveForecast, ratingForecast] = await Promise.all([
    getWave(spotId, days),
    getRating(spotId, days),
  ]);

  return waveForecast?.wave?.map((wave) => {
    const correspondingRating = ratingForecast.data.rating.find(
      (rating) => rating.timestamp === wave.timestamp
    );
    return {
      timestamp: wave.timestamp,
      wave: { min: wave.surf.min, max: wave.surf.max },
      rating: correspondingRating.rating,
    } as Forecast;
  });
};

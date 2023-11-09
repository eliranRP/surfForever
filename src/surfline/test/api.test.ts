import { Rating } from "../../api/users/types";
import { getRatingByKey, getRatingByValue } from "../../api/users/utils";
import * as api from "../api";
import { RatingResponse, WaveHeightResponse } from "../types";

describe("surfline api", () => {
  test("get forecast function should match between wave and rating data by timestamp", async () => {
    // Arrange

    const TIMESTAMP1 = 1699315200;
    const TIMESTAMP2 = 1699318800;

    const RATINGS: RatingResponse = {
      data: {
        rating: [
          {
            timestamp: TIMESTAMP1,
            utcOffset: 0,
            rating: {
              key: getRatingByKey("FAIR").key,
              value: getRatingByValue(Rating.FAIR).value,
            },
          },
          {
            timestamp: TIMESTAMP2,
            utcOffset: 0,
            rating: {
              key: getRatingByKey("GOOD").key,
              value: getRatingByValue(Rating.GOOD).value,
            },
          },
        ],
      },
    };

    const WAVE: WaveHeightResponse = {
      data: {
        wave: [
          {
            timestamp: TIMESTAMP1,
            probability: 100,
            utcOffset: 0,
            surf: {
              min: 1.2,
              max: 1.8,
              optimalScore: 2,
              plus: false,
              humanRelation: "Chest to overhead",
              raw: {
                min: 1.37,
                max: 1.67,
              },
            },
            power: 734.22422,
          },
          {
            timestamp: TIMESTAMP2,
            probability: 100,
            utcOffset: 0,
            surf: {
              min: 0.6,
              max: 1,
              optimalScore: 2,
              plus: false,
              humanRelation: "Chest to overhead",
              raw: {
                min: 1.42,
                max: 1.7,
              },
            },
            power: 794.86928,
          },
        ],
      },
    };

    jest.spyOn(api, "getRating").mockResolvedValue(RATINGS);
    jest.spyOn(api, "getWave").mockResolvedValue(WAVE);

    // Act
    const forecasts = await api.getForecast("spotId");

    // Assert
    expect(forecasts.length).toBe(2);
    const forecast1 = forecasts.find(
      (forecast) => forecast.timestamp === TIMESTAMP1
    );
    expect(forecast1).toBeDefined();
    expect(forecast1.rating.value).toBe(Rating.FAIR);
    expect(forecast1.wave.max).toBe(1.8);
    expect(forecast1.wave.min).toBe(1.2);
    const forecast2 = forecasts.find(
      (forecast) => forecast.timestamp === TIMESTAMP2
    );
    expect(forecast2).toBeDefined();
    expect(forecast2.rating.value).toBe(Rating.GOOD);
    expect(forecast2.wave.max).toBe(1);
    expect(forecast2.wave.min).toBe(0.6);
  });
});

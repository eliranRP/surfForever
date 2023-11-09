import { WaveFactory } from "../../api/user-filters/test/user-filter.factory";
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
              display: "FAIR",
            },
          },
          {
            timestamp: TIMESTAMP2,
            utcOffset: 0,
            rating: {
              key: getRatingByKey("GOOD").key,
              value: getRatingByValue(Rating.GOOD).value,
              display: "GOOD",
            },
          },
        ],
      },
    };
    const WAVE: WaveHeightResponse = {
      wave: [
        WaveFactory.build({
          timestamp: TIMESTAMP1,
          surf: { min: 1.2, max: 1.8 },
        }),
        WaveFactory.build({
          timestamp: TIMESTAMP2,
          surf: { min: 0.6, max: 1 },
        }),
      ],
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

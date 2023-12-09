import BaseCrudModel from '../../framework/base.model';
import { Forecast } from '../../surfline/types';
import SeenForecast, { ISeenForecast } from './seen-forecast.schema';
import { normalizeTimestamp } from './utils';

class SeenForecastModel extends BaseCrudModel<ISeenForecast> {
  constructor() {
    super(SeenForecast);
  }

  setSeenForecast = async (forecast: Forecast[], chatId: number, spotId: string) => {
    const promises = forecast.map((f) => {
      return this.upsert(
        { chatId, spotId, timestamp: normalizeTimestamp(f.timestamp) },
        { chatId, spotId, timestamp: normalizeTimestamp(f.timestamp) },
      );
    });
    return await Promise.all(promises);
  };
}

export default new SeenForecastModel();

import { Factory } from 'fishery';
import { Forecast, WaveData } from '../../../surfline/types';
import { faker } from '@faker-js/faker';
import { Rating } from '../../users/types';
import { ISeenForecast } from '../seen-forecast.schema';

export const ForecastFactory = Factory.define<Forecast>(() => ({
  timestamp: faker.date.future().getTime(),
  wave: {
    min: faker.datatype.number({ min: 0, max: 1 }),
    max: faker.datatype.number({ min: 1.2, max: 1.8 }),
  },
  rating: {
    key: 'FAIR',
    value: Rating.FAIR,
  },
}));

export const WaveFactory = Factory.define<WaveData>(() => ({
  timestamp: faker.datatype.number({ min: 1, max: 5 }),
  probability: 100,
  utcOffset: 0,
  surf: {
    min: faker.datatype.float({ min: 1.0, max: 2.0, precision: 0.01 }),
    max: faker.datatype.float({ min: 1.0, max: 2.0, precision: 0.01 }),
    optimalScore: faker.datatype.number({ min: 1, max: 5 }),
    plus: faker.datatype.boolean(),
    humanRelation: faker.helpers.arrayElement([
      'Knee-high',
      'Waist-high',
      'Chest to overhead',
      'Overhead',
    ]),
    raw: {
      min: faker.datatype.float({ min: 1.0, max: 2.0, precision: 0.01 }),
      max: faker.datatype.float({ min: 1.0, max: 2.0, precision: 0.01 }),
    },
  },
  power: faker.datatype.float({ min: 700, max: 800, precision: 0.01 }),
}));

export const SeenForecastFactory = Factory.define<ISeenForecast>(() => ({
  chatId: faker.datatype.number(),
  spotId: faker.datatype.uuid(),
  timestamp: faker.date.past().getTime(),
}));

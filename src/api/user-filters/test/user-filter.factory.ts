import { Factory } from "fishery";
import { Forecast } from "../../../surfline/types";
import { faker } from "@faker-js/faker";
import { Rating } from "../../users/types";

export const ForecastFactory = Factory.define<Forecast>(() => ({
  timestamp: faker.date.future().getTime(), 
  wave: {
    min: faker.datatype.number({ min: 0, max: 1 }),
    max: faker.datatype.number({ min: 1.2, max: 1.8 }),
  },
  rating: {
    key: "FAIR",
    value: Rating.FAIR,
  },
}));

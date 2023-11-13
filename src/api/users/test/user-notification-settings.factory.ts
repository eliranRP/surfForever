import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { IUserNotificationSettings } from "../user-notifications-settings.schema";
import { MORNING, Rating } from "../types";

export const UserNotificationSettingsFactory =
  Factory.define<IUserNotificationSettings>(() => ({
    waveHeightRange: {
      min: faker.datatype.number(0.6),
      max: faker.datatype.number(1),
    }, // Generate a random UUID as a string
    rating: {
      key: "FAIR",
      value: Rating.FAIR,
      display: "FAIR",
    },
    spot: {
      spotId: faker.datatype.uuid(),
      name: faker.address.city(),
      point: {
        type: "Point",
        coordinates: [
          Number(faker.address.longitude()),
          Number(faker.address.latitude()),
        ],
      },
      href: faker.internet.url(),
      breadCrumbs: [faker.address.city(), faker.address.city()],
    },
    daysToForecast: faker.datatype.number(7), // Generate a random number between 0 and 7
    preferredReminderHours: MORNING, // Generate a random number between 0 and 24
    chatId: faker.datatype.number(),
    hasNotificationTurnedOn: faker.datatype.boolean(),
  }));

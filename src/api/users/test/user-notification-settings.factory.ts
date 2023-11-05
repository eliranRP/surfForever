import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { IUserNotificationSettings } from "../user-notifications-settings.schema";

export const UserNotificationSettingsFactory =
  Factory.define<IUserNotificationSettings>(() => ({
    waveConfigurationId: faker.helpers.arrayElement([
      "poor",
      "good",
      "high",
      "very_high",
    ]), // Generate a random UUID as a string
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
    spotName: faker.address.city(),
    daysToForecast: faker.datatype.number(7), // Generate a random number between 0 and 7
    preferredReminderHours: faker.datatype.number(24), // Generate a random number between 0 and 24
    chatId: faker.datatype.number(),
  }));

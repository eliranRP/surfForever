import logger from "../../framework/logger.manager";
import { searchForPlace } from "../../surfline/api";
import { SpotLocation } from "./location.types";

export const searchSpotByName = async (
  locationName: string
): Promise<SpotLocation[]> => {
  logger.debug(`searchSpotByName locationName: ${locationName}`);
  const locationResult = await searchForPlace(locationName);
  if (locationResult.length == 0) {
    logger.error(`Location not found  location: ${locationName}`);
    throw new Error("Location not found");
  }

  const spots = locationResult[0].hits.hits.filter(
    (hit) => hit._type === "spot"
  );
  if (spots.length == 0) {
    logger.error(
      `Location not found  location: ${locationName} location result: ${locationResult}`
    );
    throw new Error("Location not found");
  }
  return spots
    .map((spot) => {
      return {
        spotId: spot._id,
        name: spot._source.name,
        point: {
          type: "Point",
          coordinates: [spot._source.location.lon, spot._source.location.lat],
        },
        href: spot._source.href,
        breadCrumbs: spot._source.breadCrumbs,
      } as SpotLocation;
    })
    .slice(0, 2);
};

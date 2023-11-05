import { locationByName } from "../location.service";
import * as api from "../../../surfline/api";
import { LOCATIONS } from "./location.fixture";
import { SearchResult } from "../../../surfline/types";

describe("should fetch surfing spots by name", () => {
  test("When inserting a location should get a list of spots", async () => {
    const locationName = "E";
    jest.spyOn(api, "searchForPlace").mockResolvedValue(LOCATIONS);
    const spots = await locationByName(locationName);
    expect(spots.length).toBeGreaterThan(0);
  });

  test("When inserting a location with no result should return error", async () => {
    const locationName = "E";
    jest.spyOn(api, "searchForPlace").mockResolvedValue([] as SearchResult[]);
    expect(() => locationByName(locationName)).rejects.toThrow(
      "Location not found"
    );
  });
});

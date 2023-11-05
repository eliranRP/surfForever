import { GeoPoint } from "../schema/point.schema";
export interface SpotLocation {
  spotId: string;
  name: string;
  point: GeoPoint;
  href: string;
  breadCrumbs: string[];
}

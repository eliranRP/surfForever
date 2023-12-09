import { GeoPoint } from './point.schema';
export interface SpotLocation {
  spotId: string;
  name: string;
  point: GeoPoint;
  href: string;
  breadCrumbs: string[];
}

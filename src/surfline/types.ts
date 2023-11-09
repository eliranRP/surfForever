import { Rating } from "../api/users/types";
import {
  RatingSchema,
  WaveHeightRange,
} from "../api/users/user-notifications-settings.schema";

export interface SearchResult {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  hits: {
    total: number;
    max_score: number;
    hits: Array<{
      _index: string;
      _type: string;
      _id: string;
      _score: number;
      _source: {
        breadCrumbs: string[];
        name: string;
        cams: any[]; // You might want to replace 'any' with a specific type
        location: {
          lon: number;
          lat: number;
        };
        href: string;
      };
    }>;
  };
  suggest: {
    "spot-suggest": Array<{
      text: string;
      offset: number;
      length: number;
      options: Array<{
        text: string;
        _index: string;
        _type: string;
        _id: string;
        _score: number;
        _source: {
          breadCrumbs: string[];
          name: string;
          cams: any[]; // You might want to replace 'any' with a specific type
          location: {
            lon: number;
            lat: number;
          };
          href: string;
        };
        contexts: {
          type: string[];
          location: string[];
        };
      }>;
    }>;
  };
  status: number;
}

export interface WaveHeightResponse {
  data: { wave: WaveData[] };
}

export interface SpotDetail {
  spot: { name: string };
}

export interface Forecast {
  timestamp: number;
  wave: WaveHeightRange;
  rating: {
    key: keyof typeof Rating;
    value: Rating;
  };
}
export interface RatingResponse {
  data: {
    rating: RatingData[];
  };
}
interface RatingData {
  timestamp: number;
  utcOffset: number;
  rating: RatingSchema;
}

interface Swell {
  height: number;
  period: number;
  impact: number;
  power: number;
  direction: number;
  directionMin: number;
  optimalScore: number;
}
interface Surf {
  min: number;
  max: number;
  optimalScore: number;
  plus: boolean;
  humanRelation: string;
  raw: {
    min: number;
    max: number;
  };
}
interface WaveData {
  timestamp: number;
  probability: number;
  utcOffset: number;
  surf: Surf;
  power: number;
  // swells: Swell[];
}

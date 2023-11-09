import { RatingSchema } from "./user-notifications-settings.schema";

export interface WaveHeightResponseButton {
  type: ChatAction;
  data: WaveTypeId;
}
export interface HoursResponseButton {
  type: ChatAction;
  data: HoursKind;
}

export interface RatingResponseButton {
  type: ChatAction;
  data: keyof typeof Rating;
}

export interface SurfingLocationResponseButton {
  type: ChatAction;
  data: { id: string };
}

export enum ChatAction {
  SET_WAVE_HEIGHT,
  SET_RATING,
  SET_LOCATION,
  SET_DAYS_TO_FORECAST,
  SET_PREFERRED_HOURS,
  CHOOSE_SURFING_LOCATION,
}

export const dayHours: number[] = Array.from({ length: 24 }, (_, i) => i);
export const MORNING: number[] = dayHours.slice(6, 12);
export const AFTERNOON: number[] = dayHours.slice(12, 18);
export const ALL_DAY = [...MORNING, ...AFTERNOON];

export enum HoursKind {
  Morning,
  Afternoon,
  AllDay,
}

export const Hours = [
  { values: MORNING, key: HoursKind.Morning, display: "Morning", emoji: "🌞" },
  {
    values: AFTERNOON,
    key: HoursKind.Afternoon,
    display: "Afternoon",
    emoji: "🌇",
  },
  { values: ALL_DAY, key: HoursKind.AllDay, display: "All Day", emoji: "🏖️" },
];
export enum RatingDisplayName {
  VERT_POOR = "Very Poor",
  POOR = "Poor",
  POOR_TO_FAIR = "Poor to Fair",
  FAIR = "Fair",
  FAIR_TO_GOOD = "Fair to Good",
  GOOD = "Good",
  VERY_GOOD = "Very Good",
}

export const RatingKind: RatingSchema[] = [
  { key: "VERY_POOR", value: 0, display: RatingDisplayName.VERT_POOR },
  { key: "POOR", value: 1, display: RatingDisplayName.POOR },
  { key: "POOR_TO_FAIR", value: 2, display: RatingDisplayName.POOR_TO_FAIR },
  { key: "FAIR", value: 3, display: RatingDisplayName.FAIR },
  { key: "FAIR_TO_GOOD", value: 4, display: RatingDisplayName.FAIR_TO_GOOD },
  { key: "GOOD", value: 5, display: RatingDisplayName.GOOD },
  { key: "VERY_GOOD", value: 6, display: RatingDisplayName.VERY_GOOD },
];
export enum Rating {
  VERY_POOR,
  POOR,
  POOR_TO_FAIR,
  FAIR,
  FAIR_TO_GOOD,
  GOOD,
  VERY_GOOD,
}

export enum WaveTypeId {
  POOR = 1,
  GOOD = 2,
  HIGH = 3,
  VERY_HIGH = 4,
}

export interface WaveConfigurationType {
  id: WaveTypeId;
  height: {
    min: number;
    max: number;
  };
}

export const WaveConfiguration: WaveConfigurationType[] = [
  {
    id: WaveTypeId.POOR,
    height: {
      min: 0,
      max: 0.6,
    },
  },
  {
    id: WaveTypeId.GOOD,
    height: {
      min: 0.6,
      max: 0.8,
    },
  },
  {
    id: WaveTypeId.HIGH,
    height: {
      min: 0.8,
      max: 1,
    },
  },
  {
    id: WaveTypeId.VERY_HIGH,
    height: {
      min: 1,
      max: 2,
    },
  },
];

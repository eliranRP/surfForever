import { SpotLocation } from "../location/location.types";
import { WaveHeightType } from "./const";

export interface ResponseButton {
  type: ChatAction;
  data: WaveHeightType;
}

export interface SurfingLocationResponseButton {
  type: ChatAction;
  data: { id: string };
}

export enum ChatAction {
  SET_WAVE_HEIGHT,
  SET_LOCATION,
  SET_DAYS_TO_FORECAST,
  SET_PREFERRED_REMINDER_HOURS,
  CHOOSE_SURFING_LOCATION,
}

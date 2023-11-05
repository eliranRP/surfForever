export type WaveDisplayName = "Poor" | "Good" | "High" | "Very High";
export type WaveHeightType = "poor" | "good" | "high" | "very_high";

export interface WaveConfigurationType {
  value: string;
  id: WaveHeightType;
  display: WaveDisplayName;
  height: {
    min: number;
    max: number;
  };
}

export const WaveConfiguration: WaveConfigurationType[] = [
  {
    id: "poor",
    value: "0",
    display: "Poor",
    height: {
      min: 0,
      max: 0.6,
    },
  },
  {
    id: "good",
    value: "1",
    display: "Good",
    height: {
      min: 0.6,
      max: 0.8,
    },
  },
  {
    id: "high",
    value: "2",
    display: "High",
    height: {
      min: 0.8,
      max: 1,
    },
  },
  {
    id: "very_high",
    value: "3",
    display: "Very High",
    height: {
      min: 1,
      max: 2,
    },
  },
];

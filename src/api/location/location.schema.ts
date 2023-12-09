import mongoose from 'mongoose';
import { pointSchema } from './point.schema';
import { SpotLocation } from './location.types';

export const spotSchema = new mongoose.Schema<SpotLocation>({
  spotId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  point: {
    type: pointSchema,
  },
  href: {
    type: String,
    required: true,
  },
  breadCrumbs: {
    type: [String], // Array of strings
    required: true,
  },
});

import mongoose, { Document, Schema } from "mongoose";

export interface ILocation extends Document {
  name: string;
  slug: string;
  image: string;
  propertyCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: true,
    },
    propertyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
locationSchema.index({ slug: 1 });
locationSchema.index({ isActive: 1 });

export default mongoose.models.Location ||
  mongoose.model<ILocation>("Location", locationSchema);

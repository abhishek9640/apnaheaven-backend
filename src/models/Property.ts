import mongoose, { Document, Schema } from "mongoose";

export interface IProperty extends Document {
  title: string;
  type: "Sale" | "Rent";
  propertyType?: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  area: string;
  parking?: string;
  image: string;
  images?: string[];
  description?: string;
  furnishing?: string;
  facing?: string;
  floor?: string;
  totalFloors?: string;
  yearBuilt?: string;
  propertyAge?: string;
  possession?: string;
  amenities?: string[];
  features?: string[];
  isFeatured?: boolean;
  status: "active" | "inactive" | "sold" | "rented";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ["Sale", "Rent"],
      required: true,
    },
    propertyType: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
    },
    beds: {
      type: Number,
      required: true,
      min: 0,
    },
    baths: {
      type: Number,
      required: true,
      min: 0,
    },
    area: {
      type: String,
      required: true,
    },
    parking: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    furnishing: String,
    facing: String,
    floor: String,
    totalFloors: String,
    yearBuilt: String,
    propertyAge: String,
    possession: String,
    amenities: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    
    isFeatured: {
    type: Boolean,
    default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "sold", "rented"],
      default: "active",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
propertySchema.index({ type: 1, status: 1 });
propertySchema.index({ location: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ createdAt: -1 });

export default mongoose.models.Property ||
  mongoose.model<IProperty>("Property", propertySchema);

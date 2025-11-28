import type { Response } from "express";
import Property from "../models/Property.js";
import type { AuthRequest } from "../middleware/auth.js";
import fs from "fs";
import path from "path";

class PropertyController {
  // CREATE PROPERTY
  async createProperty(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: "At least one image is required",
        });
        return;
      }

      // Get file paths
      const imagePaths = files.map((file) => `/uploads/properties/${file.filename}`);

      const propertyData = {
        ...req.body,
        image: imagePaths[0], // First image as main image
        images: imagePaths,
        createdBy: userId,
        amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
        features: req.body.features ? JSON.parse(req.body.features) : [],
      };

      const property = await Property.create(propertyData);

      res.status(201).json({
        success: true,
        message: "Property created successfully",
        data: property,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET ALL PROPERTIES (with filters)
  async getAllProperties(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        type,
        status,
        location,
        minPrice,
        maxPrice,
        beds,
        page = 1,
        limit = 10,
      } = req.query;

      // Build filter object
      const filter: any = {};

      if (type) filter.type = type;
      if (status) filter.status = status;
      if (location) filter.location = new RegExp(location as string, "i");
      if (beds) filter.beds = Number(beds);

      // Pagination
      const skip = (Number(page) - 1) * Number(limit);

      const properties = await Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("createdBy", "name email");

      const total = await Property.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: properties,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET SINGLE PROPERTY
  async getPropertyById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const property = await Property.findById(id).populate(
        "createdBy",
        "name email phone"
      );

      if (!property) {
        res.status(404).json({
          success: false,
          message: "Property not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: property,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // UPDATE PROPERTY
  async updateProperty(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user;

      const property = await Property.findById(id);

      if (!property) {
        res.status(404).json({
          success: false,
          message: "Property not found",
        });
        return;
      }

      // Check if user is owner or admin (you can add admin check)
      if (property.createdBy.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: "Not authorized to update this property",
        });
        return;
      }

      // Handle new images if uploaded
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const imagePaths = files.map(
          (file) => `/uploads/properties/${file.filename}`
        );
        req.body.images = [...(property.images || []), ...imagePaths];
        req.body.image = req.body.image || imagePaths[0];
      }

      // Parse arrays if sent as strings
      if (req.body.amenities && typeof req.body.amenities === "string") {
        req.body.amenities = JSON.parse(req.body.amenities);
      }
      if (req.body.features && typeof req.body.features === "string") {
        req.body.features = JSON.parse(req.body.features);
      }

      const updatedProperty = await Property.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: "Property updated successfully",
        data: updatedProperty,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE PROPERTY
  async deleteProperty(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user;

      const property = await Property.findById(id);

      if (!property) {
        res.status(404).json({
          success: false,
          message: "Property not found",
        });
        return;
      }

      // Check authorization
      if (property.createdBy.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: "Not authorized to delete this property",
        });
        return;
      }

      // Delete associated images
      if (property.images && property.images.length > 0) {
        property.images.forEach((imagePath: string) => {
          const fullPath = path.join(process.cwd(), imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }

      await Property.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Property deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE SPECIFIC IMAGE
  async deletePropertyImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;
      const userId = req.user;

      const property = await Property.findById(id);

      if (!property) {
        res.status(404).json({
          success: false,
          message: "Property not found",
        });
        return;
      }

      if (property.createdBy.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: "Not authorized",
        });
        return;
      }

      // Remove image from array
      property.images = property.images?.filter((img: any) => img !== imageUrl);

      // If main image is deleted, set new main image
      if (property.image === imageUrl && property.images.length > 0) {
        property.image = property.images[0];
      }

      await property.save();

      // Delete file from disk
      const fullPath = path.join(process.cwd(), imageUrl);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }

      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        data: property,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new PropertyController();

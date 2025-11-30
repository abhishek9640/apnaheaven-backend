import type { Response } from "express";
import Location from "../models/Location.js";
import Property from "../models/Property.js";
import type { AuthRequest } from "../middleware/auth.js";
import fs from "fs";
import path from "path";

class LocationController {
  // CREATE LOCATION (Admin only)
  async createLocation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const file = req.file as Express.Multer.File;

      if (!file) {
        res.status(400).json({
          success: false,
          message: "Location image is required",
        });
        return;
      }

      const { name } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          message: "Location name is required",
        });
        return;
      }

      // Create slug from name
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Check if location already exists
      const existingLocation = await Location.findOne({ slug });
      if (existingLocation) {
        res.status(409).json({
          success: false,
          message: "Location already exists",
        });
        return;
      }

      const imagePath = `/uploads/locations/${file.filename}`;

      const location = await Location.create({
        name,
        slug,
        image: imagePath,
      });

      res.status(201).json({
        success: true,
        message: "Location created successfully",
        data: location,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET ALL LOCATIONS
  async getAllLocations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { active } = req.query;

      const filter: any = {};
      if (active === "true") {
        filter.isActive = true;
      }

      const locations = await Location.find(filter).sort({ name: 1 });

      // Update property counts
      for (const location of locations) {
        const count = await Property.countDocuments({
          location: new RegExp(location.name, "i"),
          status: "active",
        });
        if (location.propertyCount !== count) {
          location.propertyCount = count;
          await location.save();
        }
      }

      res.status(200).json({
        success: true,
        data: locations,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET SINGLE LOCATION
  async getLocationById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const location = await Location.findById(id);

      if (!location) {
        res.status(404).json({
          success: false,
          message: "Location not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: location,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // UPDATE LOCATION (Admin only)
  async updateLocation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const file = req.file as Express.Multer.File;

      const location = await Location.findById(id);

      if (!location) {
        res.status(404).json({
          success: false,
          message: "Location not found",
        });
        return;
      }

      // Update fields
      if (req.body.name) {
        location.name = req.body.name;
        location.slug = req.body.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      }

      if (req.body.isActive !== undefined) {
        location.isActive = req.body.isActive === "true";
      }

      // Update image if provided
      if (file) {
        // Delete old image
        const oldImagePath = path.join(process.cwd(), location.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }

        location.image = `/uploads/locations/${file.filename}`;
      }

      await location.save();

      res.status(200).json({
        success: true,
        message: "Location updated successfully",
        data: location,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE LOCATION (Admin only)
  async deleteLocation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const location = await Location.findById(id);

      if (!location) {
        res.status(404).json({
          success: false,
          message: "Location not found",
        });
        return;
      }

      // Delete image
      const imagePath = path.join(process.cwd(), location.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      await Location.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Location deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new LocationController();

import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "./auth.js";
import User from "../models/User.js";

export const verifyAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role?: string;
    };

    const user = await User.findById(decoded.userId);

    if (!user || user.role !== "admin") {
      res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin privileges required" 
      });
      return;
    }

    req.user = decoded.userId;
    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

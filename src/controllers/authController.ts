import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/token.js";
import type { AuthRequest } from "../middleware/auth.js";

class AuthController {
  // REGISTER
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password } = req.body;

      if (!name || !email || !phone || !password) {
        res.status(400).json({ success: false, message: "All fields required" });
        return;
      }

      const exists = await User.findOne({ $or: [{ email }, { phone }] });
      if (exists) {
        res.status(409).json({
          success: false,
          message: "User with email/phone already exists",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
      });

      const token = generateToken(user._id.toString());

      res.status(201).json({
        success: true,
        message: "User registered",
        token,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // LOGIN
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: "Missing credentials" });
        return;
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        res.status(401).json({ success: false, message: "Invalid credentials" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: "Invalid credentials" });
        return;
      }

      const token = generateToken(user._id.toString());

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET PROFILE
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user;
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          wallet: user.wallet,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new AuthController();

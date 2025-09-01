// server/index.js (ESM)
import dotenv from "dotenv";
dotenv.config(); // load .env BEFORE using process.env.*

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Employee from "./models/Employee.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Basic middlewares
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Serve files statically (so you can view them in browser if needed)
app.use("/uploads", express.static(uploadDir));

// Multer storage for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});
const upload = multer({ storage });

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState }); // 1=connected
});

// Onboarding route (multipart/form-data)
app.post(
  "/api/onboard",
  upload.fields([
    { name: "tenthMarksheet", maxCount: 1 },
    { name: "twelfthMarksheet", maxCount: 1 },
    { name: "degreeCertificate", maxCount: 1 },
    { name: "aadhar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "photo", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // Pull body fields
      const {
        name, fatherName, phone, address, email, dob, nationality, gender,
        motherName, fatherNameFamily, siblings, emergencyContact,
        tenthPercent, twelfthPercent, ugPercent
      } = req.body;

      // Helper to map an uploaded file to our schema
      const fileFrom = (field) =>
        req.files?.[field]?.[0]
          ? {
              filename: req.files[field][0].filename,
              path: `/uploads/${req.files[field][0].filename}`,
              mimetype: req.files[field][0].mimetype,
              size: req.files[field][0].size
            }
          : undefined;

      const employee = new Employee({
        personal: {
          name,
          fatherName,
          phone,
          address,
          email,
          dob: new Date(dob),
          nationality,
          gender
        },
        family: {
          motherName,
          fatherName: fatherNameFamily || fatherName, // if you typed twice, both work
          siblings,
          emergencyContact
        },
        education: {
          tenthPercent: Number(tenthPercent),
          twelfthPercent: Number(twelfthPercent),
          ugPercent: Number(ugPercent)
        },
        documents: {
          tenthMarksheet: fileFrom("tenthMarksheet"),
          twelfthMarksheet: fileFrom("twelfthMarksheet"),
          degreeCertificate: fileFrom("degreeCertificate"),
          aadhar: fileFrom("aadhar"),
          pan: fileFrom("pan"),
          photo: fileFrom("photo")
        }
      });

      await employee.save();
      res.status(201).json({ ok: true, id: employee._id });
    } catch (err) {
      console.error("Onboard error:", err);
      res.status(400).json({ ok: false, error: err.message });
    }
  }
);

// GET all employees (for View Form)
app.get("/api/employees", async (_req, res) => {
  try {
    const employees = await Employee.find({}, {
      "personal.name": 1,
      "personal.email": 1,
      "personal.phone": 1
    }).sort({ createdAt: -1 }); // latest first
    res.json(employees);
  } catch (err) {
    console.error("GET /api/employees error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Connect DB then start server
if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env. Add it and restart.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

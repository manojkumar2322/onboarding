// server/models/Employee.js
import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  companyName: { type: String, default: "" },
  position: { type: String, default: "" },
  fromDate: { type: Date, default: null },
  toDate: { type: Date, default: null }
}, { _id: false });

const EmployeeSchema = new mongoose.Schema({
  personal: {
    name: { type: String, default: "" },  // removed required
    fatherName: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" }, 
    presentAddress: { type: String, default: "" },
    email: { type: String, default: "" },
    dob: { 
      type: Date, 
      default: null,
      set: v => (v && !isNaN(new Date(v).getTime()) ? new Date(v) : null) // handles Invalid Date
    },
    nationality: { type: String, default: "" },
    gender: { 
      type: String, 
      enum: ["Male", "Female", "Prefer not to say", "Others", ""], // allow empty
      default: ""
    },
    maritalStatus: { 
      type: String, 
      enum: ["Single", "Married", "Divorced", "Widowed", ""], 
      default: ""
    },
    spouseName: { type: String, default: "" },
    childrenNames: [{ type: String }]
  },
  family: {
    motherName: { type: String, default: "" },
    fatherName: { type: String, default: "" },
    siblings: { type: String, default: "" }, 
    emergencyContact: { type: String, default: "" }
  },
  education: {
    tenthStream: { type: String, default: "" },
    tenthPercent: { 
      type: Number, 
      default: 0,
      set: v => isNaN(v) ? 0 : Number(v) 
    },
    twelfthStream: { type: String, default: "" },
    twelfthPercent: { 
      type: Number, 
      default: 0,
      set: v => isNaN(v) ? 0 : Number(v) 
    },
    ugPercent: { 
      type: Number, 
      default: 0,
      set: v => isNaN(v) ? 0 : Number(v) 
    }
  },
  previousExperience: [experienceSchema],
  bankDetails: {
    ifscCode: { type: String, default: "" },
    accountNumber: { type: String, default: "" }
  },
  documents: {
    tenthMarksheet: fileSchema,
    twelfthMarksheet: fileSchema,
    degreeCertificate: fileSchema,
    aadhar: fileSchema,
    pan: fileSchema,
    photo: fileSchema
  }
}, { timestamps: true });

export default mongoose.model("Employee", EmployeeSchema);

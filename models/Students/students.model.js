const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"], // Enhanced with error message
      trim: true // Added to remove whitespace
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Added to prevent duplicates
      index: true,
      lowercase: true, // Added to normalize email case
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // More robust email regex
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"] // Added validation
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"], // Enhanced
      default: function () {
        return (
          "STU" +
          Math.floor(100 + Math.random() * 900) +
          Date.now().toString().slice(2, 4) +
          this.name
            .split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase()
        );
      },
    },
    // ... rest of your existing schema fields remain unchanged ...
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Added for better JSON serialization
    toObject: { virtuals: true }
  }
);

// Add index for better query performance
studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ studentId: 1 }, { unique: true });

//model
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
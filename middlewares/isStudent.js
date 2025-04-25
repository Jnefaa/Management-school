const responseStatus = require("../handlers/responseStatus.handler");
const Student = require("../models/Students/students.model");

const isStudent = async (req, res, next) => {
  try {
    const userId = req.userAuth.id;
    const Student = await Student.findById(userId);
    
    // Allow ONLY students or teachers to pass
    if (Student.role === "student" ) {
      next();
    } else {
      responseStatus(res, 403, "failed", "Access Denied. Student/teacher only route!");
    }
  } catch (error) {
    responseStatus(res, 500, "failed", "Internal server error");
  }
};

module.exports = isStudent;

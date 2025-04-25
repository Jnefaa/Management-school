const responseStatus = require("../../handlers/responseStatus.handler");
const {
  adminRegisterStudentService,
  studentLoginService,
  getStudentsProfileService,
  getAllStudentsByAdminService,
  getStudentByAdminService,
  studentUpdateProfileService,
  adminUpdateStudentService,
  studentWriteExamService,
} = require("../../services/students/students.service");

/**
 * @desc Admin Register Student
 * @route POST /api/students/admin/register
 * @access Private Admin only
 **/
exports.adminRegisterStudentController = async (req, res) => {
  console.log("➡️ Request reached controller"); // Debug 1
  try {
    console.log("📦 Request body:", req.body); // Debug 2
    
    // Use the service layer instead of direct model access
    await adminRegisterStudentService(req.body, req.userAuth?.id, res);
    
  } catch (error) {
    console.error("❌ Controller error:", error); // Debug 4
    return res.status(400).json({ error: error.message });
  }
};



/**
 * @desc Login student
 * @route POST /api/v1/students/login
 * @access Public
 **/
exports.studentLoginController = async (req, res) => {
  try {
    // Add validation
    if (!req.body.email || !req.body.password) {
      return responseStatus(res, 400, "failed", "Email and password are required");
    }
    await studentLoginService(req.body, res);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};


/**
 * @desc Student Profile
 * @route GET /api/v1/students/profile
 * @access Private Student only
 **/
exports.getStudentProfileController = async (req, res) => {
  try {
    // Add validation
   
    await getStudentsProfileService(req.userAuth.id, res);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

/**
 * @desc Get all Students
 * @route GET /api/v1/admin/students
 * @access Private admin only
 **/
exports.getAllStudentsByAdminController = async (req, res) => {
  try {
    await getAllStudentsByAdminService(res);  // ✅ Only pass `res`
  } catch (error) {
    responseStatus(res, 400, "failed rrrr", error.message);
  }
};


/**
 * @desc Get Single Student
 * @route GET /api/v1/students/:studentID/admin
 * @access Private admin only
 **/
exports.getStudentByAdminController = async (req, res) => {
  try {
    const studentId = req.params.studentId; // Get from route parameter
    const student = await getStudentByAdminService(studentId);
    responseStatus(res, 200, "success", student);
  } catch (error) {
    const statusCode = error.message === "Student not found" ? 404 : 400;
    responseStatus(res, statusCode, "failed", error.message);
  }
};


/**
 * @desc Student updating profile
 * @route UPDATE /api/v1/students/update
 * @access Private Student only
 **/
exports.studentUpdateProfileController = async (req, res) => {
  try {
    await studentUpdateProfileService(req.body, req.userAuth.id, res);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

/**
 * @desc Admin updating Students eg: Assigning classes....
 * @route UPDATE /api/v1/students/:studentID/update/admin
 * @access Private Admin only
 **/
exports.adminUpdateStudentController = async (req, res) => {
  try {
    const updatedStudent = await adminUpdateStudentService(
      req.body, 
      req.params.studentId
    );
    responseStatus(res, 200, "success", updatedStudent);
  } catch (error) {
    const statusCode = error.message === "Student not found" ? 404 : 400;
    responseStatus(res, statusCode, "failed", error.message);
  }
};


/**
 * @desc Students taking exams
 * @route POST /api/v1/students/:examId/exam-write
 * @access Private Students only
 **/
exports.studentWriteExamController = async (req, res) => {
  try {
    await studentWriteExamService(
      req.body,
      req.userAuth.id,
      req.params.examId,
      res
    );
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

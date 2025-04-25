const {
  hashPassword,
  isPassMatched,
} = require("../../handlers/passHash.handler");
const Admin = require("../../models/Staff/admin.model");
const Student = require("../../models/Students/students.model");
const Exam = require("../../models/Academic/exams.model");
const Results = require("../../models/Academic/results.model");
const generateToken = require("../../utils/tokenGenerator");
const responseStatus = require("../../handlers/responseStatus.handler");
const { resultCalculate } = require("../../functions/resultCalculate.function");

/**
 * Admin registration service for creating a new student.
 *
 * @param {Object} data - The data containing information about the new student.
 * @param {string} data.name - The name of the student.
 * @param {string} data.email - The email of the student.
 * @param {string} data.password - The password of the student.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.adminRegisterStudentService = async (data, adminId, res) => {
  const { name, email, password } = data;
  
  // 1. Verify admin exists
  const admin = await Admin.findById(adminId);
  if (!admin) {
    return responseStatus(res, 404, "failed", "Admin not found");
  }

  // 2. Check if student already exists
  const student = await Student.findOne({ email });
  if (student) {
    return responseStatus(res, 409, "failed", "Student already enrolled"); // 409 Conflict is more appropriate
  }

  // 3. Hash password
  const hashedPassword = await hashPassword(password);
  
  // 4. Create student
  const newStudent = await Student.create({
    name,
    email,
    password: hashedPassword,
    // You might want to add admin reference here
    createdBy: adminId
  });

  // 5. Add student to admin's students array and save admin
  admin.students.push(newStudent._id);
  await admin.save();

  // 6. Return success response
  return responseStatus(res, 201, "success", {
    message: "Student registered successfully",
    student: newStudent
  });
};

/**
 * Student login service.
 *
 * @param {Object} data - The data containing information about the login.
 * @param {string} data.email - The email of the student.
 * @param {string} data.password - The password of the student.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.studentLoginService = async (data, res) => {
  const { email, password } = data;
  
  // Find the user WITH password
  const student = await Student.findOne({ email }).select("+password"); // Note the +
  if (!student) {
    return responseStatus(res, 402, "failed", "Invalid login credentials");
  }

  // Verify the password
  const isMatched = await isPassMatched(password, student.password);
  if (!isMatched) {
    return responseStatus(res, 401, "failed", "Invalid login credentials");
  }

  // Remove password before sending response
  student.password = undefined;
  const responseData = { student, token: generateToken(student._id) };
  return responseStatus(res, 200, "success", responseData);
};

/**
 * Get student profile service.
 *
 * @param {string} id - The ID of the student.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.getStudentsProfileService = async (id, res) => {
  const student = await Student.findById(id).select(
    "-password -createdAt -updatedAt"
  );
  if (!student) return responseStatus(res, 402, "failed", "Student not found");
  return responseStatus(res, 200, "success", student);
};
/**
 * Get all students service (for admin use).
 *
 * @returns {Array} - An array of all students.
 */
exports.getAllStudentsByAdminService = async (res) => {
  try {
    const students = await Student.find({});
    responseStatus(res, 200, "success", students);  // ✅ Correctly uses `res`
  } catch (error) {
    responseStatus(res, 500, "failed", "Internal server error");
  }
};

/**
 * Get a single student by admin.
 *
 * @param {string} studentID - The ID of the student.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.getStudentByAdminService = async (studentID) => {
  const student = await Student.findById(studentID);
  if (!student) throw new Error("Student not found");
  return student; // Return data instead of response
};

/**
 * Student update profile service.
 *
 * @param {Object} data - The data containing information about the updated profile.
 * @param {string} userId - The ID of the student.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.studentUpdateProfileService = async (data, userId, res) => {
  const { email, password } = data;
  //if email is taken
  const emailExist = await Student.findOne({ email });
  if (emailExist)
    return responseStatus(res, 402, "failed", "This email is taken/exist");

  //hash password
  //check if user is updating password

  if (password) {
    //update
    const student = await Student.findByIdAndUpdate(
      userId,
      {
        email,
        password: await hashPassword(password),
      },
      {
        new: true,
        runValidators: true,
      }
    );
    return responseStatus(res, 200, "success", student);
  } else {
    //update
    const student = await Student.findByIdAndUpdate(
      userId,
      {
        email,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    return responseStatus(res, 200, "success", student);
  }
};
/**
 * Admin update Student service.
 *
 * @param {Object} data - The data containing information about the updated student.
 * @param {string} studentId - The ID of the student.
 * @param {Object} res - The Express response object.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.adminUpdateStudentService = async (data, studentId) => {
  const { classLevels, academicYear, program, name, email, prefectName } = data;

  // Find and update in one operation
  const updatedStudent = await Student.findByIdAndUpdate(
    studentId,
    {
      $set: {
        name,
        email,
        academicYear,
        program,
        prefectName,
      },
      $addToSet: {
        classLevels: { $each: classLevels || [] },
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedStudent) {
    throw new Error("Student not found");
  }

  return updatedStudent;
};
/**
 * Student write exam service.
 *
 * @param {string} data - The data containing information about the  exam writing
 * @param {string} studentId - The ID of the student.
 * @param {string} examId - The ID of the exam.
 * @param {Object} res - The Express response object.
 * @returns {void}
 */
exports.studentWriteExamService = async (data, studentId, examId, res) => {
  const { answers } = data;
  // find the student
  const student = await Student.findById(studentId);
  if (!student) return responseStatus(res, 404, "failed", "Student not found");
  // finding the exam
  const findExam = await Exam.findById(examId);
  if (!findExam) return responseStatus(res, 404, "failed", "Exam not found");

  // checking if the student already attended the exam
  const alreadyExamTaken = await Results.findOne({ student: student._id });
  if (alreadyExamTaken)
    return responseStatus(res, 400, "failed", "Already written the exam!");
  //checking if the student is suspended or withdrawn
  if (student.isSuspended || student.isWithdrawn)
    return responseStatus(
      res,
      401,
      "failed",
      "You are eligible to attend this exam"
    );
  // getting questions
  const questions = findExam?.questions;
  // checking is students answered all the questions
  if (questions.length !== answers.length)
    return responseStatus(
      res,
      406,
      "failed",
      "You have not answered all the questions"
    );
  // calculating results
  const result = await resultCalculate(questions, answers, findExam);
  // creating results
  const createResult = await Results.create({
    studentId: student._id,
    teacher: findExam.createdBy,
    exam: findExam._id,
    score: result.score,
    grade: result.grade,
    passMark: findExam.passMark,
    status: result.status,
    remarks: result.remarks,
    answeredQuestions: result.answeredQuestions,
    classLevel: findExam.classLevel,
    academicTerm: findExam.academicTerm,
    academicYear: findExam.academicYear,
  });
  // updating student's total scores and number of attempts
  Student.examResults.push(createResult._id);
  await Student.save();
  return responseStatus(res, 200, "success", "Answer Submitted");
};

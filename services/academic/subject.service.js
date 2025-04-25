// Import necessary models
const Subject = require("../../models/Academic/subject.model");
// const ClassLevel = require("../../models/Academic/class.model");
const Program = require("../../models/Academic/program.model");
// Import responseStatus handler
const responseStatus = require("../../handlers/responseStatus.handler");
const AcademicTerm = require('../../models/Academic/academicTerm.model'); // Add this import
const Admin = require('../../models/Staff/admin.model');

/**
 * Create Subject service.
 *
 * @param {Object} data - The data containing information about the Subject.
 * @param {string} data.name - The name of the Subject.
 * @param {string} data.description - The description of the Subject.
 * @param {string} data.academicTerm - The academic term associated with the Subject.
 * @param {string} programId - The ID of the program the Subject is associated with.
 * @param {string} userId - The ID of the user creating the Subject.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.createSubjectService = async (data, programId, userId) => {
  try {
    const { name, description, academicTermId, duration } = data;

    // Validate input
    if (!academicTermId) {
      throw new Error('Academic term ID is required');
    }

    // Validate all references exist
    const [program, academicTerm, admin] = await Promise.all([
      Program.findById(programId),
      AcademicTerm.findById(academicTermId), // Now properly defined
      Admin.findById(userId)
    ]);

    if (!program) throw new Error('Program not found');
    if (!academicTerm) throw new Error('Academic term not found');
    if (!admin) throw new Error('Admin not found');

    // Check for duplicate subject
    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      throw new Error('Subject already exists');
    }

    // Create subject with proper references
    const subject = await Subject.create({
      name,
      description,
      academicTerm: academicTerm._id, // Use the validated term
      createdBy: admin._id,
      duration: duration || "3 months"
    });

    // Update program's subjects
    program.subjects.push(subject._id);
    await program.save();

    return subject;

  } catch (error) {
    console.error('Subject creation error:', error);
    throw error;
  }
};



/**
 * Get all Subjects service.
 *
 * @returns {Array} - An array of all Subjects.
 */
exports.getAllSubjectsService = async () => {
  return await Subject.find();
};

/**
 * Get a single Subject by ID service.
 *
 * @param {string} id - The ID of the Subject.
 * @returns {Object} - The Subject object.
 */
exports.getSubjectsService = async (id) => {
  return await Subject.findById(id);
};

/**
 * Update Subject data service.
 *
 * @param {Object} data - The data containing updated information about the Subject.
 * @param {string} data.name - The updated name of the Subject.
 * @param {string} data.description - The updated description of the Subject.
 * @param {string} data.academicTerm - The updated academic term associated with the Subject.
 * @param {string} id - The ID of the Subject to be updated.
 * @param {string} userId - The ID of the user updating the Subject.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.updateSubjectService = async (data, id, userId) => {
  const { name, description, academicTerm } = data;

  // Check if the updated name already exists
  const classFound = await Subject.findOne({ name });
  if (classFound) {
    return responseStatus(res, 402, "failed", "Subject already exists");
  }

  // Update the Subject
  const Subjects = await Subject.findByIdAndUpdate(
    id,
    {
      name,
      description,
      academicTerm,
      createdBy: userId,
    },
    {
      new: true,
    }
  );

  // Send the response
  return responseStatus(res, 200, "success", Subjects);
};

/**
 * Delete Subject data service.
 *
 * @param {string} id - The ID of the Subject to be deleted.
 * @returns {Object} - The deleted Subject object.
 */
exports.deleteSubjectService = async (id) => {
  return await Subject.findByIdAndDelete(id);
};

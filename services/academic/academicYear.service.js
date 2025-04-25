// Import necessary models
const AcademicYear = require("../../models/Academic/academicYear.model");
// Import responseStatus handler
const responseStatus = require("../../handlers/responseStatus.handler");
const Admin = require("../../models/Staff/admin.model"); // Add this import

/**
 * Create academic years service.
 *
 * @param {Object} data - The data containing information about the academic year.
 * @param {string} data.name - The name of the academic year.
 * @param {string} data.fromYear - The starting year of the academic year.
 * @param {string} data.toYear - The ending year of the academic year.
 * @param {string} userId - The ID of the user creating the academic year.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.createAcademicYearService = async (data, userId) => {
  try {
    const { name, fromYear, toYear } = data;

    // Check if academic year exists
    const academicYearExists = await AcademicYear.findOne({ name });
    if (academicYearExists) {
      throw new Error("Academic year already exists");
    }

    // Create academic year
    const academicYearCreated = await AcademicYear.create({
      name,
      fromYear,
      toYear,
      createdBy: userId,
    });

    // Update admin's academicYears array
    const admin = await Admin.findById(userId);
    if (!admin) {
      throw new Error("Admin not found");
    }
    
    admin.academicYears.push(academicYearCreated._id);
    await admin.save();

    return academicYearCreated;

  } catch (error) {
    throw error; // Let the controller handle the response
  }
};


/**
 * Get all academic years service.
 *
 * @returns {Array} - An array of all academic years.
 */
exports.getAcademicYearsService = async () => {
  return await AcademicYear.find();
};

/**
 * Get academic year by ID service.
 *
 * @param {string} id - The ID of the academic year.
 * @returns {Object} - The academic year object.
 */
exports.getAcademicYearService = async (id) => {
  return await AcademicYear.findById(id);
};

/**
 * Update academic year service.
 *
 * @param {Object} data - The data containing updated information about the academic year.
 * @param {string} data.name - The updated name of the academic year.
 * @param {string} data.fromYear - The updated starting year of the academic year.
 * @param {string} data.toYear - The updated ending year of the academic year.
 * @param {string} academicId - The ID of the academic year to be updated.
 * @param {string} userId - The ID of the user updating the academic year.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.updateAcademicYearService = async (data, academicId, userId) => {
  const { name, fromYear, toYear } = data;

  // Check if name exists (excluding current record)
  const existingYear = await AcademicYear.findOne({ 
    name, 
    _id: { $ne: academicId } // Exclude current record from check
  });
  
  if (existingYear) {
    throw new Error("Academic year already exists");
  }

  // Update and return the academic year
  return await AcademicYear.findByIdAndUpdate(
    academicId,
    { 
      name, 
      fromYear, 
      toYear, 
      createdBy: userId 
    },
    { new: true, runValidators: true }
  );
};


/**
 * Delete academic year service.
 *
 * @param {string} id - The ID of the academic year to be deleted.
 * @returns {Object} - The deleted academic year object.
 */
exports.deleteAcademicYearService = async (id) => {
  return await AcademicYear.findByIdAndDelete(id);
};

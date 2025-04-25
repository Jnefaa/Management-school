// Import necessary models
const ClassLevel = require("../../models/Academic/class.model");
const Admin = require("../../models/Staff/admin.model");
// Import responseStatus handler
const responseStatus = require("../../handlers/responseStatus.handler");
/**
 * Create class service.
 *
 * @param {Object} data - The data containing information about the class.
 * @param {string} data.name - The name of the class.
 * @param {string} data.description - The description of the class.
 * @param {string} userId - The ID of the user creating the class.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.createClassLevelService = async (data, userId) => {
  const { name, description } = data;

  // Check if class exists
  const classFound = await ClassLevel.findOne({ name });
  if (classFound) {
    throw new Error("Class already exists"); // Throw error instead of sending response
  }

  // Create class
  const classCreated = await ClassLevel.create({
    name,
    description,
    createdBy: userId,
  });

  // Update admin's classLevels array
  const admin = await Admin.findById(userId);
  if (!admin) {
    throw new Error("Admin not found");
  }
  admin.classLevels.push(classCreated._id);
  await admin.save();

  return classCreated; // Return data (let controller handle response)
};

/**
 * Get all classes service.
 *
 * @returns {Array} - An array of all classes.
 */
exports.getAllClassesService = async () => {
  return await ClassLevel.find();
};

/**
 * Get a single class by ID service.
 *
 * @param {string} id - The ID of the class.
 * @returns {Object} - The class object.
 */
exports.getClassLevelsService = async (id) => {
  return await ClassLevel.findById(id);
};

/**
 * Update class data service.
 *
 * @param {Object} data - The data containing updated information about the class.
 * @param {string} data.name - The updated name of the class.
 * @param {string} data.description - The updated description of the class.
 * @param {string} id - The ID of the class to be updated.
 * @param {string} userId - The ID of the user updating the class.
 * @returns {Object} - The response object indicating success or failure.
 */
exports.updateClassLevelService = async (data, id, userId) => {
  const { name, description } = data;

  // Check if name exists (excluding current record)
  const classExists = await ClassLevel.findOne({ 
    name, 
    _id: { $ne: id } // Exclude current record from check
  });
  
  if (classExists) {
    throw new Error("Class already exists"); // Throw error instead of sending response
  }

  // Update and return the class level
  const updatedClass = await ClassLevel.findByIdAndUpdate(
    id,
    { 
      name, 
      description, 
      createdBy: userId 
    },
    { new: true, runValidators: true }
  );

  if (!updatedClass) {
    throw new Error("Class level not found");
  }

  return updatedClass; // Return data only
};
/**
 * Delete class data service.
 *
 * @param {string} id - The ID of the class to be deleted.
 * @returns {Object} - The deleted class object.
 */
exports.deleteClassLevelService = async (id) => {
  return await ClassLevel.findByIdAndDelete(id);
};

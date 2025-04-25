const responseStatus = require("../../handlers/responseStatus.handler");
const {
  createClassLevelService,
  getAllClassesService,
  getClassLevelsService,
  deleteClassLevelService,
  updateClassLevelService,
} = require("../../services/academic/class.service");

/**
 * @desc Create Class Level
 * @route POST /api/v1/class-levels
 * @access Private
 **/
exports.createClassLevelController = async (req, res) => {
  try {
    const newClass = await createClassLevelService(req.body, req.userAuth.id);
    responseStatus(res, 201, "success", newClass); // 201 for successful creation
  } catch (error) {
    const statusCode = error.message.includes("already exists") ? 409 : 400;
    responseStatus(res, statusCode, "failed", error.message);
  }
};


/**
 * @desc Get all Class Levels
 * @route GET /api/v1/class-levels
 * @access Private
 **/
exports.getClassLevelsController = async (req, res) => {
  try {
    const result = await getAllClassesService();
    responseStatus(res, 200, "success", result);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

/**
 * @desc Get single Class Level
 * @route GET /api/v1/class-levels/:id
 * @access Private
 **/
exports.getClassLevelController = async (req, res) => {
  try {
    const result = await getClassLevelsService(req.params.id);
    responseStatus(res, 200, "success", result);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

/**
 * @desc Update Class Level
 * @route Patch /api/v1/class-levels/:id
 * @access Private
 **/
exports.updateClassLevelController = async (req, res) => {
  try {
    const updatedClass = await updateClassLevelService(
      req.body,
      req.params.id,
      req.userAuth.id
    );
    responseStatus(res, 200, "success", updatedClass);
  } catch (error) {
    const statusCode = error.message.includes("already exists") ? 409 : 
                      error.message.includes("not found") ? 404 : 400;
    responseStatus(res, statusCode, "failed", error.message);
  }
};


/**
 * @desc Delete Class Level
 * @route Delete /api/v1/class-levels/:id
 * @access Private
 **/
exports.deleteClassLevelController = async (req, res) => {
  try {
    const result = await deleteClassLevelService(req.params.id);
    responseStatus(res, 200, "success", result);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

const responseStatus = require("../../handlers/responseStatus.handler");
const {
  createAcademicYearService,
  getAcademicYearsService,
  getAcademicYearService,
  updateAcademicYearService,
  deleteAcademicYearService,
} = require("../../services/academic/academicYear.service");

/**
 * @desc Create Academic Year
 * @route POST /api/v1/academic-years
 * @access Private
 **/
exports.createAcademicYearController = async (req, res) => {
  try {
    const academicYear = await createAcademicYearService(req.body, req.userAuth.id);
    responseStatus(res, 201, "success", academicYear);
  } catch (error) {
    const statusCode = error.message.includes("already exists") ? 409 : 
                      error.message.includes("not found") ? 404 : 400;
    responseStatus(res, statusCode, "failed", error.message);
  }
};


/**
 * @desc Get all Academic Years
 * @route GET /api/v1/academic-years
 * @access Private
 **/
exports.getAcademicYearsController = async (req, res) => {
  try {
    const result = await getAcademicYearsService();
    responseStatus(res, 201, "success", result);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

/**
 * @desc Get single Academic Year
 * @route GET /api/v1/academic-years/:id
 * @access Private
 **/
exports.getAcademicYearController = async (req, res) => {
  try {
    const result = await getAcademicYearService(req.params.id);
    responseStatus(res, 201, "success", result);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

/**
 * @desc Update Academic Year
 * @route Patch /api/v1/academic-years/:id
 * @access Private
 **/
exports.updateAcademicYearController = async (req, res) => {
  try {
    const updatedYear = await updateAcademicYearService(
      req.body, 
      req.params.id, 
      req.userAuth.id
    );
    
    if (!updatedYear) {
      return responseStatus(res, 404, "failed", "Academic year not found");
    }
    
    responseStatus(res, 200, "success", updatedYear);
  } catch (error) {
    const statusCode = error.message.includes("already exists") ? 409 : 400;
    responseStatus(res, statusCode, "failed", error.message);
  }
};


/**
 * @desc Delete Academic Year
 * @route Delete /api/v1/academic-years/:id
 * @access Private
 **/
exports.deleteAcademicYearController = async (req, res) => {
  try {
    const result = await deleteAcademicYearService(req.params.id);
    responseStatus(res, 201, "success", result);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

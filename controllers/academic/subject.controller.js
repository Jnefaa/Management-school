const responseStatus = require("../../handlers/responseStatus.handler");
const {
  createSubjectService,
  getAllSubjectsService,
  getSubjectsService,
  deleteSubjectService,
  updateSubjectService,
} = require("../../services/academic/subject.service");
const mongoose = require('mongoose');

/**
 * @desc Create Subject
 * @route POST /api/v1/create-subject/:programId
 * @access Private
 **/
exports.createSubjectController = async (req, res) => {
  try {
    const { programId } = req.params;
    
    // Validate programId format
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      return responseStatus(res, 400, 'failed', 'Invalid program ID format');
    }

    // Validate required fields
    if (!req.body.academicTermId) {
      return responseStatus(res, 400, 'failed', 'Academic term ID is required');
    }

    const newSubject = await createSubjectService(
      req.body,
      programId, // Use the validated ID
      req.userAuth.id
    );

    responseStatus(res, 201, 'success', {
      message: 'Subject created successfully',
      data: newSubject
    });

  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('already exists') ? 409 :
                      400;
    responseStatus(res, statusCode, 'failed', error.message);
  }
};


/**
 * @desc Get all Subjects
 * @route GET /api/v1/subject
 * @access Private
 **/
exports.getSubjectsController = async (req, res) => {
  try {
    const result = await getAllSubjectsService();
    responseStatus(res, 200, "success", result);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

/**
 * @desc Get single Subject
 * @route GET /api/v1/subject/:id
 * @access Private
 **/
exports.getSubjectController = async (req, res) => {
  try {
    const result = await getSubjectsService(req.params.id);
    responseStatus(res, 200, "success", result);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

/**
 * @desc Update Subject
 * @route Patch /api/v1/subject/:id
 * @access Private
 **/
exports.updateSubjectController = async (req, res) => {
  try {
    await updateSubjectService(req.body, req.params.id, req.userAuth.id, res);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

/**
 * @desc Delete Subject
 * @route Delete /api/v1/subject/:id
 * @access Private
 **/
exports.deleteSubjectController = async (req, res) => {
  try {
    const result = await deleteSubjectService(req.params.id);
    responseStatus(res, 200, "success", result);
  } catch (error) {
    responseStatus(res, 400, "failed", error.message);
  }
};

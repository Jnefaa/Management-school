const responseStatus = require("../handlers/responseStatus.handler");
const Admin = require("../models/Staff/admin.model");

const isAdmin = async (req, res, next) => {
  try {
    // 1. Check if userAuth exists
    if (!req.userAuth || !req.userAuth.id) {
      return responseStatus(res, 401, "failed", "Not authenticated");
    }

    // 2. Find admin
    const admin = await Admin.findById(req.userAuth.id);
    if (!admin) {
      return responseStatus(res, 404, "failed", "Admin not found");
    }

    // 3. Check role
    if (admin.role !== "admin") {
      return responseStatus(res, 403, "failed", "Access Denied. Admin only route!");
    }

    // 4. Attach admin to request for later use if needed
    req.admin = admin;
    next();
    
  } catch (error) {
    return responseStatus(res, 500, "failed", error.message);
  }
};

module.exports = isAdmin;
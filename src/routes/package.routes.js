// routes/package.routes.js
const express = require('express');
const packageRouter = express.Router();
const packageController = require('../controllers/package.controller');
const { validateToken, checkRole } = require('../middlewares/AuthMiddleware');
// CREATE: POST /api/packages
// Chỉ admin mới có thể tạo gói
packageRouter.post('/', validateToken, checkRole(['admin']), packageController.createPackage);

// READ ALL: GET /api/packages
packageRouter.get('/', packageController.getAllPackages);

// READ ONE: GET /api/packages/:id
packageRouter.get('/:id', validateToken, packageController.getPackageById);

// UPDATE: PUT /api/packages/:id
// Chỉ admin mới có thể cập nhật
packageRouter.put('/:id', validateToken, checkRole(['admin']), packageController.updatePackage);

// DELETE: DELETE /api/packages/:id
// Chỉ admin mới có thể xóa
packageRouter.delete('/:id', validateToken, checkRole(['admin']), packageController.deletePackage);

module.exports = packageRouter;
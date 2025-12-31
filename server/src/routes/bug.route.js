const express = require('express');
const router = express.Router();
const {
    createBugReport,
    getAllBugReports,
    updateBugStatus,
    deleteBugReport
} = require('../controllers/bug.controller');
const { userAuthMiddleware, adminAuthMiddleware } = require('../middlewares/auth.middleware');

// Public route (but requires login effectively handled by controller/middleware)
// Using 'userAuthMiddleware' middleware to ensure user is logged in
router.post('/', userAuthMiddleware, createBugReport);

// Admin routes
router.get('/', userAuthMiddleware, adminAuthMiddleware, getAllBugReports);
router.patch('/:id/status', userAuthMiddleware, adminAuthMiddleware, updateBugStatus);
router.delete('/:id', userAuthMiddleware, adminAuthMiddleware, deleteBugReport);

module.exports = router;

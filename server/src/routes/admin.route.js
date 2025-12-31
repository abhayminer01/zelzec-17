const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { adminAuthMiddleware } = require('../middlewares/auth.middleware');

router.post('/login', adminController.loginAdmin);
router.post('/register', adminAuthMiddleware, adminController.registerAdmin);
router.get('/', adminAuthMiddleware, adminController.getAllAdmins);
router.put('/:id', adminAuthMiddleware, adminController.updateAdmin);
router.delete('/:id', adminAuthMiddleware, adminController.deleteAdmin);


// Check Session
router.get('/check-session', adminAuthMiddleware, adminController.checkSession);

// User Management Routes
router.get('/users', adminAuthMiddleware, adminController.getAllUsers);
router.put('/users/:id', adminAuthMiddleware, adminController.updateAnyUser);
router.delete('/users/:id', adminAuthMiddleware, adminController.deleteAnyUser);

// Product Management Routes
router.delete('/product/:id', adminAuthMiddleware, adminController.deleteAnyProduct);

module.exports = router;
const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { userAuthMiddleware } = require('../middlewares/auth.middleware');
const passport = require('../config/passport');

router.get('/check', authController.checkAuth);
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);
router.get('/', userAuthMiddleware, authController.getUser);
router.put('/', userAuthMiddleware, authController.updateUser);
router.delete('/', userAuthMiddleware, authController.deleteUser);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) { return next(err); }

        if (!user) {
            return res.redirect('http://localhost:5173/login?error=auth_failed');
        }

        req.logIn(user, (err) => {
            if (err) { return next(err); }
            req.session.user = { id: user._id }; // Set session for existing middleware compatibility
            return res.redirect('http://localhost:5173/');
        });
    })(req, res, next);
});



// Email Verification Routes
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationOtp);

// Update Password Routes
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

// Favorites Routes
router.post('/favorites', userAuthMiddleware, authController.toggleFavorite);
router.get('/favorites', userAuthMiddleware, authController.getFavorites);

module.exports = router;
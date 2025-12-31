const User = require("../models/user.model");
const Product = require("../models/product.model");
const bcrypt = require('bcrypt');

const checkAuth = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(400).json({ success: false, message: "Not Authenticated" });
        }

        res.status(200).json({ success: true, message: "User is Authenticated", user: req.session.user._id });
    } catch (error) {
        res.status(500).json({ success: false, err: error });
    }
}

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, err: error })
    }
}

const registerUser = async (req, res) => {
    try {
        const { email, password, mobile, full_name, address, location, googleId } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All Fields are required!" });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exist" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user = await User.create({
            email: email,
            password: hashedPassword,
            mobile: mobile,
            full_name: full_name,
            address: address,
            location: location,
            googleId: googleId,
            isVerified: false,
            otp: otp,
            otpExpires: otpExpires
        });

        // Send Verification OTP
        const otpMailOptions = {
            from: 'Zelzec <abhayvijayan78@gmail.com>',
            to: email,
            subject: 'Verify your Email - Zelzec',
            text: `Your OTP for email verification is: ${otp}. It is valid for 10 minutes.`
        };
        transporter.sendMail(otpMailOptions, (err) => { if (err) console.error("Verification email error:", err); });

        req.session.user = { id: user._id };
        res.status(200).json({ success: true, user: user._id, message: "Registration successful. Please verify your email.", verificationRequired: true, email: email });

    } catch (error) {
        res.status(500).json({ success: false, err: error });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All Fields are required!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // 1. Check for PERMANENT deletion (expired > 15 days)
        if (user.deletionScheduledAt) {
            const deletionDate = new Date(user.deletionScheduledAt);
            const now = new Date();
            const daysSinceDeletion = (now - deletionDate) / (1000 * 60 * 60 * 24);

            if (daysSinceDeletion > 15) {
                // Permanently delete
                await Product.deleteMany({ user: user._id });
                await User.findByIdAndDelete(user._id);
                return res.status(400).json({ success: false, message: "User not found" });
            }
        }

        // 2. Verify Password BEFORE restoring soft deletion
        const compare = await bcrypt.compare(password, user.password);
        if (!compare) {
            return res.status(400).json({ success: false, message: "password missmatch" });
        }

        // 3. Handle Restoration (if soft deleted and password correct)
        let wasRestored = false;
        if (user.deletionScheduledAt) {
            wasRestored = true;
            user.deletionScheduledAt = null;
            await user.save();

            // Send Restoration Email
            const restoreMailOptions = {
                from: 'Zelzec <abhayvijayan78@gmail.com>',
                to: user.email,
                subject: 'Account Recovered - Zelzec',
                text: `Hello ${user.full_name},\n\nYour account has been successfully recovered and the deletion request has been cancelled.\n\nTime of recovery: ${new Date().toLocaleString()}`
            };
            transporter.sendMail(restoreMailOptions, (err) => { if (err) console.error("Restore email error:", err); });
        }

        req.session.user = { id: user._id };

        // 4. Send Login Notification
        const mailOptions = {
            from: 'Zelzec <abhayvijayan78@gmail.com>',
            to: user.email,
            subject: 'Zelzec Login Notification',
            text: `Hello ${user.full_name},\n\nA login to your Zelzec account was detected on ${new Date().toLocaleString()}.`
        };
        transporter.sendMail(mailOptions, (err) => { if (err) console.error("Login email error:", err); });

        // 5. Response
        res.status(200).json({
            success: true,
            message: wasRestored ? "Logged in (Account Restored)" : "Logged in successfully",
            restored: wasRestored
        });

    } catch (error) {
        res.status(500).json({ success: false, err: error });
    }
}

const updateUser = async (req, res) => {
    try {
        const { full_name, mobile, address, location } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                full_name,
                mobile,
                address,
                location
            },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, err: error });
    }
}

const logoutUser = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Could not log out" });
            }
            res.clearCookie('connect.sid'); // Assuming default session cookie name
            res.status(200).json({ success: true, message: "Logged out successfully" });
        });
    } catch (error) {
        res.status(500).json({ success: false, err: error });
    }
}

const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Expiry 10 minutes from now
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const mailOptions = {
            from: 'Zelzec <abhayvijayan78@gmail.com>',
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
            }
            res.status(200).json({ success: true, message: "OTP sent successfully" });
        });

    } catch (error) {
        res.status(500).json({ success: false, err: error.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        res.status(200).json({ success: true, message: "OTP Verified" });

    } catch (error) {
        res.status(500).json({ success: false, err: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify OTP again just in case (stateless verify prefered usually but this works for now)
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear OTP fields
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ success: false, err: error.message });
    }
};


const deleteUser = async (req, res) => {
    try {
        // Soft delete: Schedule for deletion
        const user = await User.findByIdAndUpdate(req.user._id, { deletionScheduledAt: new Date() });

        // Send Deletion Scheduled Email
        if (user && user.email) {
            const deletionMailOptions = {
                from: 'Zelzec <abhayvijayan78@gmail.com>',
                to: user.email,
                subject: 'Account Deletion Scheduled - Zelzec',
                text: `Hello ${user.full_name},\n\nWe have received your request to delete your account. Your account has been disabled and will be permanently deleted in 15 days.\n\nIf you change your mind, you can recover your account by logging in within this 15-day period.`
            };
            transporter.sendMail(deletionMailOptions, (err) => { if (err) console.error("Deletion email error:", err); });
        }

        // Clear session
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Account deletion scheduled but failed to log out" });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ success: true, message: "Account scheduled for deletion in 15 days." });
        });
    } catch (error) {
        res.status(500).json({ success: false, err: error.message });
    }
};

const toggleFavorite = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const index = user.favorites.indexOf(productId);
        if (index === -1) {
            // Add to favorites
            user.favorites.push(productId);
            await user.save();
            return res.status(200).json({ success: true, message: "Added to favorites", isFavorite: true });
        } else {
            // Remove from favorites
            user.favorites.splice(index, 1);
            await user.save();
            return res.status(200).json({ success: true, message: "Removed from favorites", isFavorite: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, err: error.message });
    }
};

const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'favorites',
            populate: { path: 'category' } // Deep populate category if needed for display
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user.favorites });
    } catch (error) {
        res.status(500).json({ success: false, err: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(200).json({ success: true, message: "Email already verified" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Email verified successfully" });

    } catch (error) {
        res.status(500).json({ success: false, err: error.message });
    }
};

const resendVerificationOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(200).json({ success: true, message: "Email already verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const mailOptions = {
            from: 'Zelzec <abhayvijayan78@gmail.com>',
            to: email,
            subject: 'Resend Verification OTP - Zelzec',
            text: `Your new OTP for email verification is: ${otp}. It is valid for 10 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
            }
            res.status(200).json({ success: true, message: "OTP sent successfully" });
        });

    } catch (error) {
        res.status(500).json({ success: false, err: error.message });
    }
};

module.exports = {
    checkAuth,
    registerUser,
    loginUser,
    getUser,
    updateUser,
    logoutUser,
    sendOtp,
    verifyOtp,
    resetPassword,
    deleteUser,
    toggleFavorite,
    getFavorites,
    verifyEmail,
    resendVerificationOtp
}
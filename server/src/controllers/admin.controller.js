const Admin = require("../models/admin.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");
const bcrypt = require('bcrypt');

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ success: false, message: "Admin Not found" });
    }

    const compare = await bcrypt.compare(password, admin.password);
    if (!compare) {
      return res.status(400).json({ success: false, message: "Password Missmatch" });
    }

    req.session.admin = { id: admin._id };
    res.status(200).json({ success: true, message: "Successfully Authenticated" });
  } catch (error) {
    res.status(500).json({ success: false, err: error });
  }
}

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    admin = await Admin.create({
      email,
      password: hashedPassword,
      name
    });

    res.status(200).json({ success: true, message: "Admin Created Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, err: error });
  }
}

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const updateData = { name, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    res.status(200).json({ success: true, message: "Admin updated successfully", data: admin });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    res.status(200).json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, err: error });
  }
}

// User Management
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, err: error.message });
  }
};

const updateAnyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, mobile, address, email } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { full_name, mobile, address, email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User updated", data: user });
  } catch (error) {
    res.status(500).json({ success: false, err: error.message });
  }
};

const deleteAnyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Ideally, delete associated products/chats/etc. here as well for cleanup
    // For "Instant Delete" requested, pure deletion is fine, but cascading is better.
    // Assuming user wants simple deletion for now as per "delete account instantly".

    res.status(200).json({ success: true, message: "User deleted permanently" });
  } catch (error) {
    res.status(500).json({ success: false, err: error.message });
  }
};

const deleteAnyProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Reason from admin

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Email Notification Logic
    if (product.user) {
      const user = await User.findById(product.user);
      if (user && user.email) {
        const emailSubject = "Product Removal Notification - Zelzec";
        const emailText = `Hello ${user.full_name},\n\nYour product "${product.title}" has been removed by the administrator.\n\nReason: ${reason || "Violation of policies or request for removal."}\n\nIf you have any questions, please contact support.`;

        // Use the email service
        const { sendEmail } = require('../services/email.service');
        await sendEmail(user.email, emailSubject, emailText);
      }
    }

    // Proceed to delete
    await Product.findByIdAndDelete(id);

    // Decrement user product count logic
    if (product.user) {
      await User.findByIdAndUpdate(product.user, { $inc: { products: -1 } });
    }

    res.status(200).json({ success: true, message: "Product deleted and user notified" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const checkSession = async (req, res) => {
  // If the request reaches here, the middleware has already verified the session
  res.status(200).json({ success: true, message: "Session Valid", data: req.session.admin });
};

module.exports = {
  loginAdmin,
  getAllAdmins,
  registerAdmin,
  updateAdmin,
  deleteAdmin,
  getAllUsers,
  updateAnyUser,
  deleteAnyUser,
  deleteAnyProduct,
  checkSession
}
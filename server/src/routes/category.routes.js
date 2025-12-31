const express = require("express");
const router = express.Router();
const Category = require("../models/category.model");

// ✅ Create Category
router.post("/", async (req, res) => {
  try {
    const { title, description, icon, form_data } = req.body;
    const category = await Category.create({ title, description, icon, form_data });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating category", error });
  }
});

// ✅ Get All
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching categories", error });
  }
});

// ✅ Update
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, form_data } = req.body;

    const updated = await Category.findByIdAndUpdate(
      id,
      { title, description, icon, form_data },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating category", error });
  }
});

// ✅ Delete
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting category", error });
  }
});

router.patch('/:id/toggle-primary', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the category
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        // Toggle primary
        category.primary = !category.primary;
        await category.save();

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, err: error.message });
    }
});

// CLIENT SIDE ROUTES
// Get all primary categories
router.get('/primary', async(req, res) => {
  try {
    const categories = await Category.find({ primary : true });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, err: error.message });
  }
});

// Get Form Data for render form
router.get('/formdata/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    res.status(200).json({ success : true, data : category });
  } catch (error) {
    res.status(500).json({ success: false, err: error.message });
  }
});

module.exports = router;

const Product = require("../models/product.model");
const User = require("../models/user.model");
const Category = require("../models/category.model");

const createProduct = async (req, res) => {
  try {
    // Check product limit
    const existingProductsCount = await Product.countDocuments({ user: req.user._id });
    if (existingProductsCount >= 8) {
      return res.status(400).json({ success: false, message: "You have reached the maximum limit of 8 products." });
    }

    const {
      category,
      title,
      description,
      form_data,
      price,
      location,
    } = req.body;

    if (req.files.length > 6) {
      return res.status(400).json({ success: false, message: "You can upload a maximum of 6 images." });
    }

    const images = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    }));

    const newProduct = new Product({
      category,
      user: req.user._id,
      title,
      description,
      form_data: JSON.parse(form_data),
      images,
      price,
      location: JSON.parse(location),
    });

    const user = await User.findByIdAndUpdate(req.user._id, { $inc: { products: 1 } });

    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, err: error.message });
  }
};

// GET PRODUCTS FOR HOME PAGE
// GET ALL PRODUCTS (FILTER, SORT, PAGINATE, SEARCH)
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      priceMin,
      priceMax,
      location,
      sort,
    } = req.query;

    // 1️⃣ Build Query Object
    const query = {};

    console.log("DEBUG: getAllProducts query params:", req.query);

    // Search (Text search on title, description, form_data OR Category Name)
    if (search) {
      // 1. Find categories matching the search term
      const matchingCategories = await Category.find({
        title: { $regex: search, $options: "i" }
      }).select("_id");

      const matchingCategoryIds = matchingCategories.map(c => c._id);

      // 2. Build $or query
      query.$or = [
        { $text: { $search: search } }, // Matches title, desc, form_data via Wildcard Index
        { category: { $in: matchingCategoryIds } } // Matches products in those categories
      ];
    }

    // Category Filter
    if (category) {
      query.category = category;
    }

    // Price Filter
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // Location Filter (Regex for partial match)
    if (location) {
      query['location.place'] = { $regex: location, $options: 'i' };
    }

    // Filter by Unknown User (Admin feature)
    if (req.query.unknownUser === 'true') {
      const validUserIds = await User.find().distinct('_id');
      // Find products where user is NOT in validUserIds (Orphans) OR is explicitly null
      query.$or = [
        { user: { $nin: validUserIds } },
        { user: null },
        { user: { $exists: false } }
      ];
    }

    // Dynamic Filters (from form_data)
    // Expecting query params like ?filter_brand=Samsung&filter_fuel=Petrol
    Object.keys(req.query).forEach((key) => {
      if (key.startsWith('filter_')) {
        const fieldName = key.replace('filter_', '');
        if (req.query[key]) {
          // If comma separated (multiple values), use $in
          // Otherwise use regex for flexible matching or exact match
          // Using regex for now for flexibility, or $in if it's an array
          // Let's assume exact match if it looks like a select option, regex if text?
          // Safest for now: regex/partial match for everything to be safe
          query[`form_data.${fieldName}`] = { $regex: req.query[key], $options: 'i' };
        }
      }
    });

    // 2️⃣ Sorting
    let sortOptions = {};
    if (sort === 'price_low') {
      sortOptions.price = 1;
    } else if (sort === 'price_high') {
      sortOptions.price = -1;
    } else if (sort === 'oldest') {
      sortOptions.createdAt = 1;
    } else {
      sortOptions.createdAt = -1; // Default: Newest first
    }

    // 3️⃣ Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // 4️⃣ Execute Query
    const products = await Product.find(query)
      .populate('category', 'title icon')
      .populate('user', 'full_name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalItems = await Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems,
        hasNextPage: pageNum * limitNum < totalItems,
        hasPrevPage: pageNum > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching products',
      error: error.message,
    });
  }
}

// GET PRODUCT FOR PRODUCT PAGE
const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id)
      .populate("user", "full_name email")
      .populate("category", "title");
    res.status(200).json({ success: true, data: product })
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching product',
    });
  }
}

// GET LISTED PRODUCTS BY USERS
const getListedProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error
    });
  }
}

// GET PRODUCTS ACCORDING TO CATEGORY
const getProductsForCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;   // FIX 1: Read from params

    const products = await Product
      .find({ category: categoryId })   // FIX 2: add await & correct filter
      .populate("category")             // FIX 3: correct populate key
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    console.log("❌ CATEGORY FILTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET RELATED PRODUCTS FOR PRODUCT DETAILS PAGE
const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Get the current product
    const currentProduct = await Product.findById(id);

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2️⃣ Find related products
    const relatedProducts = await Product.find({
      _id: { $ne: currentProduct._id },            // exclude current product
      category: currentProduct.category,           // same category
    })
      .limit(4)
      .sort({ createdAt: -1 })
      .select("title description price images location");       // send only needed fields

    res.status(200).json({
      success: true,
      data: relatedProducts,
    });

  } catch (error) {
    console.error("❌ Error fetching related products:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching related products",
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const product = await Product.findOneAndDelete({ _id: id, user: userId });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    // Decrement user product count
    await User.findByIdAndUpdate(userId, { $inc: { products: -1 } });

    // Optional: Delete images from filesystem if needed (using fs.unlink)

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Server error deleting product" });
  }
};

// GET HOME PAGE DATA (Featured + Category Sections)
const getHomePageData = async (req, res) => {
  try {
    // 1. Featured Products (Latest 10 global)
    const featuredProducts = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('category', 'title icon')
      .select('title price images location category description');

    // 2. Primary Categories Sections
    const primaryCategories = await Category.find({ primary: true });

    const sections = [];
    for (const cat of primaryCategories) {
      const products = await Product.find({ category: cat._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title price images location description');

      if (products.length > 0) {
        sections.push({
          category: cat,
          products
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        featured: featuredProducts,
        sections: sections
      }
    });

  } catch (error) {
    console.error("Error fetching home page data:", error);
    res.status(500).json({ success: false, message: "Server error fetching home data" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    let updates = { ...req.body };

    // Prevent updating user or category directly if not intended
    delete updates.user;

    // Handle JSON parsing for multipart form data
    if (typeof updates.form_data === 'string') {
      try {
        updates.form_data = JSON.parse(updates.form_data);
      } catch (e) {
        console.error("Error parsing form_data", e);
      }
    }

    if (typeof updates.location === 'string') {
      try {
        updates.location = JSON.parse(updates.location);
      } catch (e) {
        console.error("Error parsing location", e);
      }
    }

    // Handle Images
    // 1. Parse existing_images (URLs of images to keep)
    let existingImages = [];
    if (updates.existing_images) {
      if (typeof updates.existing_images === 'string') {
        try {
          existingImages = JSON.parse(updates.existing_images);
        } catch (e) {
          // If it's a single string URL not in JSON array format, wrap it
          existingImages = [updates.existing_images];
        }
      } else if (Array.isArray(updates.existing_images)) {
        existingImages = updates.existing_images;
      } else {
        existingImages = [updates.existing_images];
      }
    }

    // 2. Process new files
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
      }));
    }

    // 3. Construct final images array if any image change is requested
    // If existing_images or files are present, we assume an image update is intended
    if (updates.existing_images || (req.files && req.files.length > 0)) {
      // Transform existing images from URL strings/objects to schema format
      const formattedExisting = existingImages.map(img => {
        // If img is object with url, keep it. If string, allow it (legacy support might need schema adjustment)
        // Schema expects { url: String, filename: String }
        if (typeof img === 'string') return { url: img };
        return img;
      });
      updates.images = [...formattedExisting, ...newImages];
      delete updates.existing_images; // clean up aux field
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updates },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Server error updating product" });
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  getListedProducts,
  getProductsForCategory,
  getRelatedProducts,
  deleteProduct,
  updateProduct,
  getHomePageData
}

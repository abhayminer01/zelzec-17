const express = require("express");
const upload = require("../middlewares/multer");
const router = express.Router();
const productController = require('../controllers/product.controller');
const { userAuthMiddleware } = require("../middlewares/auth.middleware");

router.post("/create", upload.array("images", 6), userAuthMiddleware, productController.createProduct);
router.get("/profile", userAuthMiddleware, productController.getListedProducts);
router.get("/", productController.getAllProducts);
router.get("/home", productController.getHomePageData);
router.get("/:id", productController.getProduct);
router.get('/find-by-category/:id', productController.getProductsForCategory);
router.get('/related-products/:id', productController.getRelatedProducts);
router.delete("/:id", userAuthMiddleware, productController.deleteProduct);
router.put("/:id", upload.array("images", 6), userAuthMiddleware, productController.updateProduct);


module.exports = router;
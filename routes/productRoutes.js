import express from "express";
import {
  brainTreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFiltersController,
  productListController,
  productPhotoController,
  searchProductController,
  updateProductController,
} from "../controllers/productController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";

const router = express.Router();

// Routes

// Create a new product
router.post(
  "/create-product",
  requireSignIn, // Require user to be signed in
  isAdmin, // Require user to be an admin
  formidable(), // Handle file uploads
  createProductController
);

// Update an existing product
router.put(
  "/update-product/:pid",
  requireSignIn, // Require user to be signed in
  isAdmin, // Require user to be an admin
  formidable(), // Handle file uploads
  updateProductController
);

// Get all products
router.get("/get-product", getProductController);

// Get a single product by slug
router.get("/get-product/:slug", getSingleProductController);

// Get product photo by product ID
router.get("/product-photo/:pid", productPhotoController);

// Delete a product by product ID
router.delete("/delete-product/:pid", deleteProductController);

// Filter products based on criteria (e.g., category, price range, district)
router.post("/product-filters", productFiltersController);

// Get total count of products
router.get("/product-count", productCountController);

// Get products with pagination
router.get("/product-list/:page", productListController);

// Search products by keyword
router.get("/search/:keyword", searchProductController);


// Get products by category slug
router.get("/product-category/:slug", productCategoryController);

// Payment Gateway Routes

// Generate Braintree token for payment
router.get("/braintree/token", braintreeTokenController);

// Process Braintree payment
router.post("/braintree/payment", requireSignIn, brainTreePaymentController);

export default router;
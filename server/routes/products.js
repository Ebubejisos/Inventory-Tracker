// CRUD routes for products using te controller methods defined in products.js
// No middleware is needed for these routes as they are simple unguarded CRUD operations
import express from "express";
const router = express.Router();

import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controllers/products.js";
import { validateProductCreation } from "../middleware/validation.js";

router.post("/items", validateProductCreation, createProduct);
router.get("/items", getProducts);
router.get("/items/:id", getProductById);
router.put("/items/:id", updateProduct);
router.delete("/items/:id", deleteProduct);

export default router;
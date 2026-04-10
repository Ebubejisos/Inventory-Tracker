// validator methods for each route to ensure that the incoming request data is valid before it reaches the controller methods
// This helps to prevent invalid data from being processed and can return appropriate error responses to the client if the validation fails
import { body, param } from "express-validator";

export const validateProductCreation = [
  body("name").notEmpty().withMessage("Product name is required"),
  body("brand").notEmpty().withMessage("Brand is required"),
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
  body("expiry_date").isDate().withMessage("Expiry date must be a valid date"),
];
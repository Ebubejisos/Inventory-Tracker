// Methods to handle CRUD operations for products
// Reads and writes to the SQLite database using the db module
// returns a JSON res[ponse or an error message as appropriate
import pool from "../db/index.js";

const createProduct = async (req, res, next) => {
  const { name, description, price } = req.body;
  const [result] = await pool.execute("INSERT INTO products (name, description, price) VALUES (?, ?, ?)", [name, description, price]);
  res.status(201).json({ message: "Product created successfully", id: result.insertId });
}

const getProducts = async (req, res, next) => {
  res.status(200).json([]);
}

const getProductById = async (req, res, next) => {
  res.status(200).json({});
}

const updateProduct = async (req, res, next) => {
  res.status(200).json({ message: "Product updated successfully" });
}

const deleteProduct = async (req, res, next) => {
  res.status(200).json({ message: "Product deleted successfully" });
}

export { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
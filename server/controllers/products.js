// Methods to handle CRUD operations for products
// Reads and writes to the SQLite database using the db module
// returns a JSON res[ponse or an error message as appropriate
import pool from "../db/index.js";
/*
const createProduct = async (req, res, next) => {
  const { name, brand, batch_number, quantity, expiry_date } = req.body;
  const [result] = await pool.execute("INSERT INTO drugs (name, brand, batch_number, quantity, expiry_date) VALUES (?, ?, ?, ?, ?)", [name, brand, batch_number, quantity, expiry_date]);
  res.status(201).json({ message: "Product created successfully", id: result.insertId });
}
  */

// createProduct wrapped in a try catch block to handle errors and return appropriate responses that uses postgreSQL syntax similar to the one above
const createProduct = async (req, res, next) => {
  try {
    const { name, brand, quantity, expiry_date } = req.body;

    const result = await pool.query(
      `INSERT INTO drugs (name, brand, quantity, expiry_date) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [name, brand, quantity, expiry_date]
    );

    res.status(201).json(result.rows[0]); // ✅ clean response

  } catch (error) {
    console.error("Error creating product:", error);
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  // resolve search term and filter by status (low_stock, out_of_stock, close_to_expiry) from query parameters
  // send get request to the database to retrieve all products and return them as a JSON response
  const { search, status, page, limit } = req.query;

  let query = "SELECT * FROM drugs";
  const params = [];

  if (search) {
    query += " WHERE name ILIKE $1 OR brand ILIKE $1";
    params.push(`%${search}%`);
  }

  if (status) {
    if (status === "low_stock") {
      query += params.length > 0 ? " AND quantity < 10" : " WHERE quantity < 10";
    } else if (status === "out_of_stock") {
      query += params.length > 0 ? " AND quantity = 0" : " WHERE quantity = 0";
    } else if (status === "close_to_expiry") {
      query += params.length > 0 ? " AND expiry_date >= CURRENT_DATE AND expiry_date < CURRENT_DATE + INTERVAL '90 days'" : " WHERE expiry_date >= CURRENT_DATE AND expiry_date < CURRENT_DATE + INTERVAL '90 days'";
    }
  }

  if (page && limit) {
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
  } else {
    query += " ORDER BY created_at DESC";
  }

  const result = await pool.query(query, params);
  res.status(200).json(result.rows);
}

const getProductSummary = async (req, res, next) => {
  // send get request to the database to retrieve all product summaries returning (count: total, low stock (q < 10), out_of_stock (q = 0), close_to_expiry (today <= expiry_date < today + 90 days)) and return them as a JSON response
  const result = await pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN quantity < 10 THEN 1 END) as low_stock, COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock, COUNT(CASE WHEN expiry_date >= CURRENT_DATE AND expiry_date < CURRENT_DATE + INTERVAL '90 days' THEN 1 END) as close_to_expiry FROM drugs");
  res.status(200).json(result.rows[0]);
}

const getProductById = async (req, res, next) => {
  // send get request to the database to retrieve a product by its id and return it as a JSON response
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM drugs WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json(result.rows[0]);
  // res.status(200).json({});
}

const updateProduct = async (req, res, next) => {
  // send put request to the database to update a product by its id and return a success message as a JSON response
  const { id } = req.params;
  const { name, brand, quantity, expiry_date } = req.body;
  const result = await pool.query("UPDATE drugs SET name = $1, brand = $2, quantity = $3, expiry_date = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING * ", [name, brand, quantity, expiry_date, id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json(result.rows[0]);
}

const deleteProduct = async (req, res, next) => {
  // send delete request to the database to delete a product by its id and return a success message as a JSON response
  const { id } = req.params;
  const result = await pool.query("DELETE FROM drugs WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json({ message: "Product deleted successfully" });
}

export { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductSummary };
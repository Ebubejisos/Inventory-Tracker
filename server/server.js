import express from "express";
import cors from "cors";
import pool from "./db/index.js"

const app = express();

const port = process.env.PORT || 8000;

// middlewares
app.use(cors());
app.use(express.json());


app.listen(port, () => {
  console.log(`server is running at port ${port}`)
});



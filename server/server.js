import express from "express";
import cors from "cors";

const app = express();

const port = process.env.PORT || 8000;

// middlewares
// CORS middleware to allow cross-origin requests from the client (Defines what client url can be allowed to access the server resources)
app.use(cors());

// Middleware to parse incoming JSON requests and make the data available in req.body
app.use(express.json());

//ROUTES
app.use("/api", (await import("./routes/products.js")).default);

app.listen(port, () => {
  console.log(`server is running at port ${port}`)
});



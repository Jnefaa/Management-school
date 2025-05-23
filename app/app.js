const express = require("express");
const morgan = require("morgan");
const routeSync = require("../handlers/routeSync.handler");
const cors = require('cors')
const studentsRouter = require("../routes/v1/students/students.router")
// Initialize the Express application
const app = express();
// Middleware
app.use(express.json());
app.use(morgan("dev")); // Log requests to the console (Express 4)
// Initialize cors 
app.use(cors())

// Initialize staff route
routeSync(app, "staff");
// initialize academic route
routeSync(app, "academic");
// initialize student route
routeSync(app, "students");

// Define a default route
app.get("/", (req, res) => {
  res.send("Server is running!");
});
// Handle invalid routes
app.use("/api/v1", studentsRouter);

module.exports = app;

const http = require("http");
const app = require("./app/app");
const studentsRouter = require("./routes/v1/students/students.router");
require("dotenv").config();
require("colors");
// database connection
require("./config/dbConnect");
// ports
const port = process.env.PORT || 3001;
// initialize server
const server = http.createServer(app);

server.listen(port, () => {
  console.log(` server is running on port : ${port} `.black.bgGreen.bold);
});

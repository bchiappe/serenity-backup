const express = require("express");
const cors = require("cors");
const paginate = require("express-paginate");
const config = require("config");
const router = require("./routes");
const Database = require("./services/database");

// Initialize Express app
const app = express();
app
  .use(cors({ origin: true }))
  .use(express.json())
  .use(paginate.middleware(10, 50))
  .use((req, res, next) => {
    const d = new Database();
    d.connect().then(() => {
      next();
    });
  })
  .use("/", router)
  .get("/", (req, res) => {
    return res.status(200).send("Serenity Backup API");
  });

// Start express listening on port
const port = config.get("server.port");
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

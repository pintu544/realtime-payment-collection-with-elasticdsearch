const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const yaml = require("js-yaml");

// Load environment variables
dotenv.config();

// Initialize app and HTTP server
const app = express();
const server = http.createServer(app);
// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io",
});

// Middleware
app.use(express.json());
app.use(cors());

// WebSocket connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Handle customer updates
  socket.on("customerUpdate", (data) => {
    io.emit("customerChange", data);
  });
});

// Export io so it can be used in other parts of our app (e.g., controllers)
app.set("socketio", io);

// Routes
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const paymentRoutes = require("./routes/payments");
const notificationRoutes = require("./routes/notifications");

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

// Swagger API docs
try {
  const swaggerDocument = yaml.load(fs.readFileSync("./swagger.yaml", "utf8"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.error("Error loading swagger.yaml:", error);
}

// Error middleware (simplified)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "An internal error occurred" });
});

// Initialize MySQL connection and sync models
const sequelize = require("./config/database");
const User = require("./models/user");
const Payment = require("./models/payment");

sequelize
  .sync()
  .then(() => {
    console.log("MySQL database & tables created!");
  })
  .catch((error) => {
    console.error("Error syncing MySQL:", error);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

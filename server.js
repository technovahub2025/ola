const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const {
  handleDriverOnline,
  handleDriverOffline,
  handleManualOffline,
  getOnlineDrivers
} = require("./controller/websocket");

const {
  setIoInstance
} = require("./controller/bookingapi");

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

// Parse JSON
app.use(express.json());

// Parse form-urlencoded
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors());

/* =========================
   INVALID JSON GUARD
========================= */

app.use((err, req, res, next) => {

  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {

    console.error("INVALID JSON:", err.message);

    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload"
    });
  }

  next();
});

/* =========================
   ROUTES
========================= */

app.use("/api", require("./route/route"));
app.use("/api", require("./route/websocket"));
app.use("/api", require("./route/bookingapi"));
app.use("/api", require("./route/driverprofile"));

/* =========================
   ENV LOGS
========================= */

console.log("MAIL_USER:", process.env.MAIL_USER);
console.log("MAIL_PASS exists:", !!process.env.MAIL_PASS);

/* =========================
   MONGODB
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB Error:", err);
  });

/* =========================
   HTTP SERVER
========================= */

const server = http.createServer(app);

/* =========================
   SOCKET.IO
========================= */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Set socket instance
setIoInstance(io);

/* =========================
   SOCKET EVENTS
========================= */

io.on("connection", (socket) => {

  console.log("Socket connected:", socket.id);

  socket.on("driverOnline", (driverId) => {
    handleDriverOnline(io, socket, driverId);
  });

  socket.on("driverOffline", (driverId) => {
    handleManualOffline(io, socket, driverId);
  });

  socket.on("getOnlineDrivers", () => {
    getOnlineDrivers(io, socket);
  });

  socket.on("disconnect", () => {
    handleDriverOffline(io, socket);
  });

  socket.on("error", (error) => {
    console.error("Socket Error:", error);
  });
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server running successfully"
  });
});

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
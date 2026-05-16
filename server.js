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
  getOnlineDrivers,
  notifyBookingAssignment,
  notifyBookingStatusUpdate
} = require("./controller/websocket");
const { 
  createBooking, 
  assignBookingToDriver, 
  getDriverBookings, 
  updateBookingStatus, 
  getAllBookings,
  setIoInstance
} = require("./controller/bookingapi");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", require("./route/route"));
app.use("/api", require("./route/websocket"));
app.use("/api", require("./route/bookingapi"));
app.use("/api", require("./route/driverprofile"));


console.log("MAIL_USER:", process.env.MAIL_USER);
console.log("MAIL_PASS exists:", !!process.env.MAIL_PASS);



mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


const server = http.createServer(app);

// 🔥 ATTACH SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Set io instance for booking controller
setIoInstance(io);

// ===============================
// SOCKET LOGIC
// ===============================
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
    console.error("Socket error:", error);
  });
});

// Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

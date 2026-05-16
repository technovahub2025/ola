const User = require("../model/registermodel");
const Booking = require("../model/bookingmodel");

const handleDriverOnline = async (io, socket, driverId) => {
  try {
    socket.driverId = driverId;
    socket.join(`driver_${driverId}`);

    await User.findByIdAndUpdate(driverId, {
      isOnline: true,
      lastSeen: new Date()
    });

    io.emit("driverStatusChanged", {
      driverId,
      isOnline: true,
      timestamp: new Date()
    });

    console.log(`Driver ${driverId} is now ONLINE`);

    // Send any pending bookings for this driver
    const pendingBookings = await Booking.find({
      driverId: driverId,
      status: "assigned"
    }).populate('userId', 'name email phone');

    if (pendingBookings.length > 0) {
      socket.emit("pendingBookings", {
        bookings: pendingBookings,
        count: pendingBookings.length
      });
    }

    socket.emit("connectionStatus", {
      status: "connected",
      driverId,
      message: "Successfully connected as online driver"
    });

  } catch (error) {
    console.error("Error setting driver online:", error);
    socket.emit("error", { message: "Failed to set online status" });
  }
};

const handleDriverOffline = async (io, socket) => {
  try {
    if (socket.driverId) {
      await User.findByIdAndUpdate(socket.driverId, {
        isOnline: false,
        lastSeen: new Date()
      });

      io.emit("driverStatusChanged", {
        driverId: socket.driverId,
        isOnline: false,
        timestamp: new Date()
      });

      console.log(`Driver ${socket.driverId} is now OFFLINE`);
    }
  } catch (error) {
    console.error("Error setting driver offline:", error);
  }
};

const handleManualOffline = async (io, socket, driverId) => {
  try {
    await User.findByIdAndUpdate(driverId, {
      isOnline: false,
      lastSeen: new Date()
    });

    io.emit("driverStatusChanged", {
      driverId,
      isOnline: false,
      timestamp: new Date()
    });

    console.log(`Driver ${driverId} manually went OFFLINE`);

    socket.emit("connectionStatus", {
      status: "disconnected",
      message: "Successfully set to offline"
    });

  } catch (error) {
    console.error("Error setting manual offline:", error);
    socket.emit("error", { message: "Failed to set offline status" });
  }
};

const getOnlineDrivers = async (io, socket) => {
  try {
    const onlineDrivers = await User.find({
      role: "driver",
      isOnline: true
    }).select('name email _id lastSeen');

    socket.emit("onlineDriversList", {
      drivers: onlineDrivers,
      count: onlineDrivers.length
    });

  } catch (error) {
    console.error("Error fetching online drivers:", error);
    socket.emit("error", { message: "Failed to fetch online drivers" });
  }
};

const notifyBookingAssignment = async (io, bookingId, driverId) => {
  try {
    const booking = await Booking.findById(bookingId).populate('userId', 'name email phone');
    const driver = await User.findById(driverId).select('name email phone image');

    if (!booking || !driver) {
      throw new Error("Booking or driver not found");
    }

    // Send notification to specific driver by their ID
    io.to(`driver_${driverId}`).emit("newBookingAssignment", {
      booking,
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        image: driver.image
      },
      timestamp: new Date()
    });

    console.log(`Booking ${bookingId} assigned to driver ${driver.name} (${driverId})`);

  } catch (error) {
    console.error("Error notifying booking assignment:", error);
  }
};

const notifyBookingStatusUpdate = async (io, bookingId, status) => {
  try {
    const booking = await Booking.findById(bookingId).populate('userId driverId', 'name email phone');

    if (!booking) {
      throw new Error("Booking not found");
    }

    const message = status === 'completed' ? "Ride Completed" : `Booking status updated to: ${status}`;

    // Broadcast status update to all connected clients
    io.emit("bookingStatusUpdate", {
      booking,
      status,
      message,
      timestamp: new Date()
    });

    // Send specific notification to assigned driver
    if (booking.driverId) {
      io.to(`driver_${booking.driverId._id}`).emit("bookingUpdate", {
        booking,
        status,
        message
      });
    }

    console.log(`Booking ${bookingId} status updated to: ${status}`);

  } catch (error) {
    console.error("Error notifying booking status update:", error);
  }
};

module.exports = {
  handleDriverOnline,
  handleDriverOffline,
  handleManualOffline,
  getOnlineDrivers,
  notifyBookingAssignment,
  notifyBookingStatusUpdate
};
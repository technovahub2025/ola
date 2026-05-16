const Booking = require("../model/bookingmodel");
const User = require("../model/registermodel");
const { notifyBookingAssignment, notifyBookingStatusUpdate } = require("./websocket");

// Store io instance to use in controller functions
let ioInstance = null;

const setIoInstance = (io) => {
  ioInstance = io;
};

const createBooking = async (req, res) => {
  try {
    const {
      userId,
      pickupLocation,
      dropoffLocation,
      pickupCoordinates,
      dropoffCoordinates,
      price,
      distance,
      estimatedTime,
      customerName,
      customerPhone,
      notes,
      paymentMethod
    } = req.body;

    // Validation
    if (!userId || !pickupLocation || !dropoffLocation || !price || !customerName || !customerPhone) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Create booking
    const booking = new Booking({
      userId,
      pickupLocation,
      dropoffLocation,
      pickupCoordinates,
      dropoffCoordinates,
      price,
      distance: distance || 0,
      estimatedTime: estimatedTime || 0,
      customerName,
      customerPhone,
      notes: notes || "",
      paymentMethod: paymentMethod || "cash"
    });

    await booking.save();

    // Get online drivers for assignment
    const onlineDrivers = await User.find({ 
      role: "driver", 
      isOnline: true 
    }).select('_id name email phone');

    res.status(201).json({
      message: "Booking created successfully",
      booking,
      availableDrivers: onlineDrivers,
      driversCount: onlineDrivers.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

const assignBookingToDriver = async (req, res) => {
  try {
    const { bookingId, driverName } = req.body;

    if (!bookingId || !driverName) {
      return res.status(400).json({ message: "Booking ID and Driver Name are required" });
    }

    // Check if booking exists and is pending
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking cannot be assigned" });
    }

    // Find driver by name instead of ID
    const driver = await User.findOne({ 
      name: driverName, 
      role: "driver" 
    });
    
    if (!driver) {
      return res.status(404).json({ message: "Driver not found with this name" });
    }

    if (!driver.isOnline) {
      return res.status(400).json({ message: "Driver is not online" });
    }

    // Assign booking to driver
    booking.driverId = driver._id;
    booking.status = "assigned";
    booking.assignedAt = new Date();
    await booking.save();

    // Send WebSocket notification to driver by name
    if (ioInstance) {
      await notifyBookingAssignment(ioInstance, bookingId, driver._id);
    }

    res.status(200).json({
      message: "Booking assigned successfully",
      booking,
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        email: driver.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign booking",
      error: error.message,
    });
  }
};

const getDriverBookings = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Only return ASSIGNED bookings for driver app
    const bookings = await Booking.find({ 
      driverId: driverId,
      status: { $in: ["assigned", "ongoing"] } // Only show assigned and ongoing bookings
    })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
      count: bookings.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch driver bookings",
      error: error.message,
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!["assigned", "ongoing", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    
    if (status === "completed") {
      booking.completedAt = new Date();
      booking.paymentStatus = "paid";
    }

    await booking.save();

    // Send WebSocket notification
    if (ioInstance) {
      await notifyBookingStatusUpdate(ioInstance, bookingId, status);
    }

    res.status(200).json({
      message: "Booking status updated successfully",
      booking
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update booking status",
      error: error.message,
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate('driverId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
      count: bookings.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  assignBookingToDriver,
  getDriverBookings,
  updateBookingStatus,
  getAllBookings,
  setIoInstance
};

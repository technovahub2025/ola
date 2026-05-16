const Booking = require("../model/bookingmodel");
const User = require("../model/registermodel");
const {
  notifyBookingAssignment,
  notifyBookingStatusUpdate,
} = require("./websocket");

let ioInstance = null;

const setIoInstance = (io) => {
  ioInstance = io;
};

// Create booking
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
      paymentMethod,
    } = req.body;

    if (
      !userId ||
      !pickupLocation ||
      !dropoffLocation ||
      !price ||
      !customerName ||
      !customerPhone
    ) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    const booking = await Booking.create({
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
      paymentMethod: paymentMethod || "cash",
    });

    const onlineDrivers = await User.find({
      role: "driver",
      isOnline: true,
    })
      .select("_id name phone email vehicleType rating")
      .limit(10)
      .lean();

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
      availableDrivers: onlineDrivers,
      driversCount: onlineDrivers.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

// Assign booking to driver using driverId
const assignBookingToDriver = async (req, res) => {
  try {
    const { bookingId, driverId } = req.body;

    if (!bookingId || !driverId) {
      return res.status(400).json({
        message: "Booking ID and Driver ID are required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Booking cannot be assigned",
      });
    }

    const driver = await User.findOne({
      _id: driverId,
      role: "driver",
    }).select("_id name phone email isOnline");

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    if (!driver.isOnline) {
      return res.status(400).json({
        message: "Driver is not online",
      });
    }

    booking.driverId = driver._id;
    booking.status = "assigned";
    booking.assignedAt = new Date();

    await booking.save();

    if (ioInstance) {
      await notifyBookingAssignment(ioInstance, booking._id, driver._id);
    }

    return res.status(200).json({
      message: "Booking assigned successfully",
      booking,
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to assign booking",
      error: error.message,
    });
  }
};

// Get driver bookings
const getDriverBookings = async (req, res) => {
  try {
    const { driverId } = req.params;

    const bookings = await Booking.find({
      $or: [
        {
          driverId,
          status: { $in: ["assigned", "ongoing"] },
        },
        {
          status: "pending",
          driverId: null,
        },
      ],
    })
      .populate("userId", "name phone")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch driver bookings",
      error: error.message,
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, driverId } = req.body;

    const validStatuses = [
      "pending",
      "assigned",
      "ongoing",
      "completed",
      "cancelled",
      "rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        received: status,
        allowed: validStatuses,
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.status = status;

    if (driverId) {
      booking.driverId = driverId;

      if (status === "assigned" || status === "ongoing") {
        booking.assignedAt = new Date();
      }
    }

    if (status === "completed") {
      booking.completedAt = new Date();
    }

    await booking.save();

    if (ioInstance) {
      await notifyBookingStatusUpdate(ioInstance, booking._id, status);
    }

    return res.status(200).json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update booking status",
      error: error.message,
    });
  }
};

// Admin: get all bookings
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const filter = status ? { status } : {};

    const bookings = await Booking.find(filter)
      .populate("userId", "name phone")
      .populate("driverId", "name phone")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Booking.countDocuments(filter);

    return res.status(200).json({
      success: true,
      bookings,
      count: bookings.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("userId", "name email phone")
      .populate("driverId", "name email phone image vehicleNumber vehicleType")
      .lean();

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        message: "Cannot cancel completed booking",
      });
    }

    booking.status = "cancelled";
    booking.notes = reason
      ? `${booking.notes || ""} - Cancelled: ${reason}`
      : `${booking.notes || ""} - Cancelled`;

    await booking.save();

    if (ioInstance) {
      await notifyBookingStatusUpdate(ioInstance, booking._id, "cancelled");
    }

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ userId })
      .populate("driverId", "name phone image vehicleNumber vehicleType")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user bookings",
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
  getBookingById,
  cancelBooking,
  getUserBookings,
  setIoInstance,
};
const User = require("../model/registermodel");

const getDriverProfile = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await User.findById(driverId)
      .select('name email phone image experience startlocation endlocation driverLicense vehicleNumber vehicleType rating isOnline lastSeen');

    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({
      success: true,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        image: driver.image,
        experience: driver.experience,
        startlocation: driver.startlocation,
        endlocation: driver.endlocation,
        driverLicense: driver.driverLicense,
        vehicleNumber: driver.vehicleNumber,
        vehicleType: driver.vehicleType,
        rating: driver.rating || 0,
        isOnline: driver.isOnline,
        lastSeen: driver.lastSeen
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch driver profile",
      error: error.message,
    });
  }
};

const updateDriverProfile = async (req, res) => {
  try {
    const { driverId } = req.params;
    const {
      name,
      phone,
      image,
      experience,
      startlocation,
      endlocation,
      driverLicense,
      vehicleNumber,
      vehicleType
    } = req.body;

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Update driver profile
    if (name) driver.name = name;
    if (phone) driver.phone = phone;
    if (image !== undefined) driver.image = image; // Base64 image string
    if (experience !== undefined) driver.experience = experience;
    if (startlocation !== undefined) driver.startlocation = startlocation;
    if (endlocation !== undefined) driver.endlocation = endlocation;
    if (driverLicense !== undefined) driver.driverLicense = driverLicense;
    if (vehicleNumber !== undefined) driver.vehicleNumber = vehicleNumber;
    if (vehicleType) driver.vehicleType = vehicleType;

    await driver.save();

    res.status(200).json({
      message: "Driver profile updated successfully",
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        image: driver.image,
        experience: driver.experience,
        startlocation: driver.startlocation,
        endlocation: driver.endlocation,
        driverLicense: driver.driverLicense,
        vehicleNumber: driver.vehicleNumber,
        vehicleType: driver.vehicleType,
        rating: driver.rating || 0,
        isOnline: driver.isOnline
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update driver profile",
      error: error.message,
    });
  }
};

const uploadDriverImage = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image data is required" });
    }

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Validate base64 image (basic validation)
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    driver.image = image;
    await driver.save();

    res.status(200).json({
      message: "Driver image uploaded successfully",
      image: driver.image
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to upload driver image",
      error: error.message,
    });
  }
};

const driverLogout = async (req, res) => {
  try {
    const { driverId } = req.body;
    
    if (!driverId) {
      return res.status(400).json({ message: "Driver ID is required" });
    }

    // Verify it's a driver
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== "driver") {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Update driver status to offline
    await User.findByIdAndUpdate(driverId, { 
      isOnline: false,
      lastSeen: new Date()
    });

    res.status(200).json({
      message: "Driver logout successful",
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: "Driver logout failed",
      error: error.message,
    });
  }
};

module.exports = {
  getDriverProfile,
  updateDriverProfile,
  uploadDriverImage,
  driverLogout
};

const User = require("../model/registermodel");

const getbyrole = async (req, res) => {
  try {
    const drivers = await User.find({ role: "driver" })
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   ADD USER
================================ */
const addUser = async (req, res) => {
  try {
    console.log(req.body);

    const {
      name,
      phone,
      price,
      rating,
      image,
      experience,
      role
    } = req.body;

    // Role validation
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required (admin or driver)"
      });
    }

    // Additional validation for drivers
    if (role === 'driver') {
      if (!price || price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price is required for drivers"
        });
      }
    }

    const user = await User.create({
      name,
      phone,
      price,
      rating,
      image,
      experience,
      role
    });

    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   UPDATE USER
================================ */
const updateUser = async (req, res) => {
  try {
    const {
      name,
      phone,
      price,
      rating,
      image,
      experience,
      role
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        phone,
        price,
        rating,
        image,
        experience,
        role
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   DELETE USER
================================ */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   EXPORTS
================================ */
module.exports = {
  addUser,
  updateUser,
  deleteUser,
  getbyrole,          // Returns only drivers
  getAllUsersForAdmin   // Returns all users
};
const Booking = require("../model/bookingmodel");

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, completedAt } = req.body;

        // Validation - match booking model enum
        const validStatuses = ["pending", "assigned", "ongoing", "completed", "cancelled"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status",
                validStatuses: validStatuses
            });
        }

        // Prepare update object
        const updateData = { status };
        
      
        if (status === 'completed') {
            updateData.completedAt = completedAt || new Date();
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        console.log(`DEBUG: Booking ${id} status updated to: ${status}`);

        res.status(200).json({
            message: "Booking status updated successfully",
            booking,
        });
    } catch (error) {
        console.error('DEBUG: Status update error:', error);
        res.status(500).json({
            message: "Failed to update booking status",
            error: error.message,
        });
    }
};

module.exports = { updateBookingStatus };

# Booking API Documentation

## Separate Booking API Structure

I've created a completely separate booking API with its own controller and route files for better organization:

### 📁 **File Structure:**
```
c:\olauserbackend\
├── controller\
│   ├── bookingapi.js          # NEW: Separate booking controller
│   ├── bookingcontroller.js   # OLD: Can be removed/replaced
│   └── ...
├── route\
│   ├── bookingapi.js         # NEW: Separate booking route
│   ├── booking.js            # OLD: Can be removed/replaced
│   └── ...
└── server.js                 # Updated to use new booking API
```

## 🚀 **New Booking API Endpoints:**

### **Booking CRUD Operations:**

#### POST /api/booking/create
Create a new booking request.

**Request Body:**
```json
{
  "userId": "user_id_here",
  "pickupLocation": "123 Pickup St",
  "dropoffLocation": "456 Dropoff Ave",
  "pickupCoordinates": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "dropoffCoordinates": {
    "lat": 40.7580,
    "lng": -73.9855
  },
  "price": 25.50,
  "distance": 5.2,
  "estimatedTime": 15,
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "notes": "Please call upon arrival",
  "paymentMethod": "cash"
}
```

#### GET /api/booking/:bookingId
Get specific booking details by ID.

**Response:**
```json
{
  "success": true,
  "booking": {
    "_id": "booking_id",
    "userId": "user_id",
    "driverId": "driver_id",
    "pickupLocation": "123 Pickup St",
    "dropoffLocation": "456 Dropoff Ave",
    "price": 25.50,
    "status": "assigned",
    "userId": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "driverId": {
      "name": "Driver Name",
      "email": "driver@example.com",
      "phone": "+1234567890",
      "image": "data:image/jpeg;base64,..."
    }
  }
}
```

#### PUT /api/booking/status/:bookingId
Update booking status.

**Request Body:**
```json
{
  "status": "ongoing"
}
```

#### DELETE /api/booking/cancel/:bookingId
Cancel a booking.

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

### **Booking Listings:**

#### GET /api/bookings
Get all bookings (admin view) with optional status filter.

**Query Parameters:**
- `status` (optional): Filter by booking status

#### GET /api/booking/driver/:driverId
Get bookings for specific driver (only assigned and ongoing).

#### GET /api/booking/user/:userId
Get bookings for specific user (all statuses).

### **Booking Assignment:**

#### POST /api/booking/assign
Assign booking to driver by name.

**Request Body:**
```json
{
  "bookingId": "booking_id_here",
  "driverName": "John Driver"
}
```

## 🔧 **Controller Functions:**

### **Core Functions:**
- `createBooking()` - Create new booking
- `assignBookingToDriver()` - Assign to driver by name
- `getDriverBookings()` - Get driver's assigned bookings only
- `updateBookingStatus()` - Update booking status
- `getAllBookings()` - Admin view of all bookings
- `getBookingById()` - Get specific booking
- `cancelBooking()` - Cancel booking with reason
- `getUserBookings()` - Get user's booking history

### **Enhanced Features:**
- ✅ **Separate API Structure** - Clean organization
- ✅ **WebSocket Integration** - Real-time notifications
- ✅ **Driver Name Assignment** - User-friendly assignment
- ✅ **Booking Cancellation** - With reason tracking
- ✅ **User Booking History** - Complete booking tracking
- ✅ **Enhanced Error Handling** - Better error messages

## 📡 **WebSocket Events:**

The booking API integrates with WebSocket for real-time updates:

- `newBookingAssignment` - When booking is assigned to driver
- `bookingStatusUpdate` - When booking status changes
- `bookingUpdate` - Specific driver notifications

## 🔄 **Migration Steps:**

1. **New Files Created:**
   - `controller/bookingapi.js` - Complete booking controller
   - `route/bookingapi.js` - Booking route definitions

2. **Server Updated:**
   - `server.js` now imports from `bookingapi` instead of `bookingcontroller`

3. **Old Files:**
   - `controller/bookingcontroller.js` - Can be safely removed
   - `route/booking.js` - Can be safely removed

## 🎯 **Benefits of Separate API:**

1. **Better Organization** - Clear separation of concerns
2. **Easier Maintenance** - Focused booking logic
3. **Scalability** - Easy to extend booking features
4. **Clean Routes** - Dedicated booking endpoints
5. **Modular Design** - Independent booking module

## 📱 **Usage Example:**

```javascript
// Create booking
POST /api/booking/create
{
  "userId": "user123",
  "pickupLocation": "123 Main St",
  "dropoffLocation": "456 Oak Ave",
  "price": 25.50,
  "customerName": "John Doe",
  "customerPhone": "+1234567890"
}

// Assign to driver
POST /api/booking/assign
{
  "bookingId": "booking123",
  "driverName": "John Driver"
}

// Get driver bookings
GET /api/booking/driver/driver123
// Returns only assigned and ongoing bookings
```

The booking API is now completely separate and well-organized!

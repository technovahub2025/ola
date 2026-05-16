# Complete API Documentation

## Authentication APIs

### POST /api/auth/logout
Logs out a user and sets their status to offline.

**Request Body:**
```json
{
  "userId": "user_id_here"
}
```

**Response:**
```json
{
  "message": "Logout successful",
  "success": true
}
```

## Registration APIs (Updated)

### POST /api/auth/register
Register a new user with all required fields including locations.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "confirmPassword": "password123",
  "startlocation": "123 Main St",
  "endlocation": "456 Oak Ave"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "userId": "user_id_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "startlocation": "123 Main St",
    "endlocation": "456 Oak Ave",
    "role": "user"
  }
}
```

### POST /api/driver/register
Register a new driver with all required fields.

**Request Body:**
```json
{
  "name": "Driver Name",
  "email": "driver@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "confirmPassword": "password123",
  "startlocation": "Driver Base Location",
  "endlocation": "Service Area"
}
```

**Response:**
```json
{
  "message": "Driver registered successfully",
  "userId": "driver_id_here",
  "user": {
    "id": "driver_id",
    "name": "Driver Name",
    "email": "driver@example.com",
    "phone": "+1234567890",
    "startlocation": "Driver Base Location",
    "endlocation": "Service Area",
    "role": "driver"
  }
}
```

## Booking APIs

### POST /api/booking/create
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

**Response:**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "_id": "booking_id",
    "userId": "user_id",
    "pickupLocation": "123 Pickup St",
    "dropoffLocation": "456 Dropoff Ave",
    "price": 25.50,
    "status": "pending"
  },
  "availableDrivers": [
    {
      "_id": "driver_id",
      "name": "Driver Name",
      "email": "driver@example.com",
      "phone": "+1234567890"
    }
  ],
  "driversCount": 3
}
```

### POST /api/booking/assign
Assign a booking to a specific driver.

**Request Body:**
```json
{
  "bookingId": "booking_id_here",
  "driverId": "driver_id_here"
}
```

**Response:**
```json
{
  "message": "Booking assigned successfully",
  "booking": {
    "_id": "booking_id",
    "driverId": "driver_id",
    "status": "assigned",
    "assignedAt": "2024-01-27T..."
  },
  "driver": {
    "id": "driver_id",
    "name": "Driver Name",
    "phone": "+1234567890",
    "email": "driver@example.com"
  }
}
```

### GET /api/booking/driver/:driverId
Get all bookings for a specific driver.

**Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "booking_id",
      "pickupLocation": "123 Pickup St",
      "dropoffLocation": "456 Dropoff Ave",
      "price": 25.50,
      "status": "assigned",
      "userId": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      }
    }
  ],
  "count": 1
}
```

### PUT /api/booking/status/:bookingId
Update booking status.

**Request Body:**
```json
{
  "status": "ongoing"
}
```

**Response:**
```json
{
  "message": "Booking status updated successfully",
  "booking": {
    "_id": "booking_id",
    "status": "ongoing"
  }
}
```

### GET /api/bookings
Get all bookings with optional status filter.

**Query Parameters:**
- `status` (optional): Filter by booking status (pending, assigned, ongoing, completed, cancelled)

**Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "booking_id",
      "pickupLocation": "123 Pickup St",
      "dropoffLocation": "456 Dropoff Ave",
      "price": 25.50,
      "status": "pending",
      "userId": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "driverId": null
    }
  ],
  "count": 1
}
```

## WebSocket Events for Booking System

### Driver Side Events:

**Listen for:**
- `newBookingAssignment` - When a new booking is assigned to driver
- `bookingUpdate` - When booking status is updated
- `pendingBookings` - List of pending bookings when driver comes online

**Emit:**
- `driverOnline(driverId)` - When driver comes online
- `driverOffline(driverId)` - When driver goes offline

### Example Driver App Integration:

```javascript
// Connect to WebSocket
const socket = io('http://localhost:4000');

// After driver login
socket.emit('driverOnline', driverId);

// Listen for new bookings
socket.on('newBookingAssignment', (data) => {
  console.log('New booking:', data.booking);
  // Show notification to driver
  showBookingNotification(data.booking);
});

// Listen for booking updates
socket.on('bookingUpdate', (data) => {
  console.log('Booking updated:', data.booking);
  // Update UI
  updateBookingStatus(data.booking);
});

// When app goes to background
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    socket.emit('driverOffline', driverId);
  } else {
    socket.emit('driverOnline', driverId);
  }
});
```

## Booking Status Flow:

1. **pending** → Booking created, waiting for assignment
2. **assigned** → Booking assigned to driver
3. **ongoing** → Driver started the trip
4. **completed** → Trip completed, payment processed
5. **cancelled** → Booking cancelled

## Database Schema:

### Booking Model:
- `userId` - Reference to User who created booking
- `driverId` - Reference to assigned driver
- `pickupLocation` - Pickup address
- `dropoffLocation` - Dropoff address
- `pickupCoordinates` - GPS coordinates for pickup
- `dropoffCoordinates` - GPS coordinates for dropoff
- `status` - Current booking status
- `price` - Trip cost
- `distance` - Trip distance
- `estimatedTime` - Estimated trip time
- `customerName` - Customer name
- `customerPhone` - Customer phone
- `notes` - Additional notes
- `assignedAt` - When booking was assigned
- `completedAt` - When booking was completed
- `paymentStatus` - Payment status
- `paymentMethod` - Payment method used

### User Model (Updated):
- `startlocation` - User's preferred start location
- `endlocation` - User's preferred end location
- `isOnline` - Online status (for drivers)
- `lastSeen` - Last seen timestamp

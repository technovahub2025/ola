# Driver App API Documentation

## Driver Profile Management

### GET /api/driver/profile/:driverId
Get driver profile information including image.

**Response:**
```json
{
  "success": true,
  "driver": {
    "id": "driver_id",
    "name": "John Driver",
    "email": "driver@example.com",
    "phone": "+1234567890",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "experience": 5,
    "startlocation": "City Center",
    "endlocation": "Airport",
    "driverLicense": "DL123456",
    "vehicleNumber": "ABC-1234",
    "vehicleType": "car",
    "rating": 4.5,
    "isOnline": true,
    "lastSeen": "2024-01-27T..."
  }
}
```

### PUT /api/driver/profile/:driverId
Update driver profile information.

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1234567890",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "experience": 6,
  "startlocation": "New Location",
  "endlocation": "New End Location",
  "driverLicense": "DL789012",
  "vehicleNumber": "XYZ-5678",
  "vehicleType": "bike"
}
```

**Response:**
```json
{
  "message": "Driver profile updated successfully",
  "driver": {
    "id": "driver_id",
    "name": "Updated Name",
    "email": "driver@example.com",
    "phone": "+1234567890",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "experience": 6,
    "startlocation": "New Location",
    "endlocation": "New End Location",
    "driverLicense": "DL789012",
    "vehicleNumber": "XYZ-5678",
    "vehicleType": "bike",
    "rating": 4.5,
    "isOnline": true
  }
}
```

### POST /api/driver/upload-image/:driverId
Upload driver profile image as base64.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**
```json
{
  "message": "Driver image uploaded successfully",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

### POST /api/driver/logout
Driver logout functionality.

**Request Body:**
```json
{
  "driverId": "driver_id_here"
}
```

**Response:**
```json
{
  "message": "Driver logout successful",
  "success": true
}
```

## Driver Bookings (Only Assigned)

### GET /api/booking/driver/:driverId
Get only ASSIGNED and ONGOING bookings for driver app.

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
      "assignedAt": "2024-01-27T...",
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

## Booking Assignment by Driver Name

### POST /api/booking/assign
Assign booking to driver using driver name instead of ID.

**Request Body:**
```json
{
  "bookingId": "booking_id_here",
  "driverName": "John Driver"
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
    "name": "John Driver",
    "phone": "+1234567890",
    "email": "driver@example.com"
  }
}
```

## WebSocket Events for Driver App

### Driver Side Events:

**Listen for:**
- `newBookingAssignment` - When a new booking is assigned to this driver
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

// Listen for new bookings (includes driver image)
socket.on('newBookingAssignment', (data) => {
  console.log('New booking assigned:', data.booking);
  console.log('Driver info:', data.driver);
  
  // Show notification with driver image
  showBookingNotification({
    booking: data.booking,
    driverImage: data.driver.image
  });
});

// Listen for booking updates
socket.on('bookingUpdate', (data) => {
  console.log('Booking updated:', data.booking);
  console.log('Status:', data.status);
  
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

## Base64 Image Handling

### Frontend Image Upload Example:

```javascript
// Convert file to base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Upload driver image
const uploadDriverImage = async (driverId, imageFile) => {
  const base64Image = await convertToBase64(imageFile);
  
  const response = await fetch(`/api/driver/upload-image/${driverId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image
    })
  });
  
  return response.json();
};
```

### Display Base64 Image in Flutter:

```dart
// Display base64 image in Flutter
Widget buildDriverImage(String base64Image) {
  return Image.memory(
    base64Decode(base64Image.split(',')[1]), // Remove "data:image/jpeg;base64," prefix
    width: 100,
    height: 100,
    fit: BoxFit.cover,
  );
}
```

## Key Changes Made:

1. **Driver Bookings Filter**: Now only shows `assigned` and `ongoing` bookings (no pending/completed/cancelled)
2. **Booking Assignment**: Changed from driver ID to driver name for easier assignment
3. **Driver Profile**: Complete profile management with base64 image support
4. **Enhanced User Model**: Added vehicle details, license, and more driver-specific fields
5. **Driver Logout**: Separate logout endpoint for drivers
6. **WebSocket Enhancements**: Includes driver image in booking notifications

## Database Schema Updates:

### User Model (Enhanced):
- `image` - Base64 string for driver photo
- `driverLicense` - Driver license number
- `vehicleNumber` - Vehicle registration number
- `vehicleType` - Type of vehicle (car, bike, auto, truck)
- `role` - Now includes "user" option

### Booking Assignment Flow:
1. Admin assigns booking using driver name
2. System finds driver by name and assigns booking
3. WebSocket notification sent to specific driver
4. Driver app shows only assigned/ongoing bookings

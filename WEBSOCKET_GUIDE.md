# WebSocket Driver Status Implementation

## Overview
This implementation provides real-time driver online/offline status tracking using WebSocket (Socket.IO).

## Features
- ✅ Real-time driver status updates
- ✅ Automatic offline detection on disconnect
- ✅ Manual offline/online toggle
- ✅ Online drivers list
- ✅ Last seen tracking
- ✅ REST API endpoints for status queries

## WebSocket Events

### Client to Server:
- `driverOnline(driverId)` - Mark driver as online
- `driverOffline(driverId)` - Mark driver as offline
- `getOnlineDrivers()` - Get list of online drivers

### Server to Client:
- `driverStatusChanged` - Broadcast when driver status changes
- `onlineDriversList` - List of current online drivers
- `connectionStatus` - Connection status messages
- `error` - Error messages

## REST API Endpoints

### GET /api/drivers/online
Get all currently online drivers.

**Response:**
```json
{
  "success": true,
  "drivers": [...],
  "count": 5
}
```

### GET /api/drivers/status/:driverId
Get specific driver's status.

**Response:**
```json
{
  "success": true,
  "driver": {
    "id": "driver_id",
    "name": "Driver Name",
    "isOnline": true,
    "lastSeen": "2024-01-26T..."
  }
}
```

## Frontend Integration

### Connect to WebSocket:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

// Listen for status changes
socket.on('driverStatusChanged', (data) => {
  console.log(`Driver ${data.driverId} is now ${data.isOnline ? 'ONLINE' : 'OFFLINE'}`);
});

// Get online drivers
socket.emit('getOnlineDrivers');
socket.on('onlineDriversList', (data) => {
  console.log('Online drivers:', data.drivers);
});
```

### After Driver Login:
```javascript
// After successful login, emit driver online
socket.emit('driverOnline', driverId);

// When driver manually goes offline (app background/close)
socket.emit('driverOffline', driverId);
```

### App Lifecycle Events:
```javascript
// App goes to background
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    socket.emit('driverOffline', driverId);
  } else {
    socket.emit('driverOnline', driverId);
  }
});

// App closing
window.addEventListener('beforeunload', () => {
  socket.emit('driverOffline', driverId);
});
```

## Database Schema
The User model includes:
- `isOnline`: Boolean (default: false)
- `lastSeen`: Date (auto-updated)

## Usage Flow
1. Driver logs in → Set `isOnline: true` in DB → Emit WebSocket event
2. Driver goes offline → Set `isOnline: false` → Emit WebSocket event
3. Real-time updates broadcast to all connected clients
4. REST APIs available for status queries

## Testing
Start the server and test with WebSocket client or Postman for REST endpoints.

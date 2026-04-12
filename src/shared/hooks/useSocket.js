import { io } from 'socket.io-client';

// Single socket.io instance for the whole app.
// Import this singleton instead of calling io() directly in components/contexts.
const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: false,
});

export default socket;

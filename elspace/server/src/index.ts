import 'dotenv/config';
import app from './app';
import { createServer } from 'http';
import { setupWebSocket } from './websocket/socket';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

const httpServer = createServer(app);
setupWebSocket(httpServer);

const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default server;

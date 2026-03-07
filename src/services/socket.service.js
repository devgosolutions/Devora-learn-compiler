const socketIo = require('socket.io');
const logger = require('../utils/logger');

let io;

const init = (server, clientUrl) => {
  io = socketIo(server, {
    cors: {
      origin: clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join:job', (jobId) => {
      socket.join(`job:${jobId}`);
      logger.info(`Socket ${socket.id} joined room job:${jobId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const emitToJob = (jobId, event, data) => {
  if (io) {
    io.to(`job:${jobId}`).emit(event, data);
  } else {
    logger.error('Socket.io not initialized');
  }
};

module.exports = {
  init,
  emitToJob,
};

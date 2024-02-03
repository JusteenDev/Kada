const stream = require("socket.io-stream");
const socket = require('socket.io');
const express = require('express');
const http = require('http'); // Use the 'http' module instead of 'https'
const cors = require('cors');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const app = express();
const PORT = 8266;

const server = http.createServer(app); // Use 'http' instead of 'https'
const io = socket(server, {
  cors: {
    origin: 'https://monster-sweet-illegally.ngrok-free.app',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

const connectionEvent = io.of("/connection");

connectionEvent.on("connection", (socket) => {
  console.log('USER HAS BEEN CONNECTED');

  const file = `${__dirname}/test.mp4`;

  if (!fs.existsSync(file)) {
    console.error(`Error: The file ${file} does not exist.`);
    return;
  }

  const fStream = fs.createReadStream(file);

  fStream.on('data', (chunk) => {
    console.log(`Sending chunk to the client: ${chunk.length} bytes`);
    connectionEvent.emit('stream-chunk', chunk);
  });

  fStream.on('end', () => {
    connectionEvent.emit('stream-end');
    console.log('Stream Ended');
  });

  socket.on("clientMessage", (data) => {
    console.log(`Received message from client: ${data}`);
    connectionEvent.emit("serverUpdate", "STREAM ID: 1");
  });

  socket.on("playVideo", () => {
    console.log('Received play command from client');
    connectionEvent.emit("playVideo"); // Broadcast play command to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("USER HAS BEEN DISCONNECTED");
  });
});

server.listen(PORT, () => {
  console.log(`[ SOCKET ] listening on port ${PORT} `);
});
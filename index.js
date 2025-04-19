// Import dependencies
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

// Setup aplikasi Express
const app = express();
app.use(cors());

// Buat HTTP server
const server = http.createServer(app);

// Inisialisasi Socket.io dengan CORS yang dikonfigurasi
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Alamat frontend Anda
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// API route dasar
app.get("/", (req, res) => {
  res.send("Socket.IO Server sedang berjalan");
});

// Menangani koneksi socket
io.on("connection", (socket) => {
  console.log(`User terhubung: ${socket.id}`);

  // Mengirim pesan selamat datang ke client yang baru terhubung
  socket.emit("welcome", `Selamat datang, ID Anda: ${socket.id}`);

  // Memberitahu semua client bahwa user baru telah terhubung
  socket.broadcast.emit(
    "userJoined",
    `User baru telah terhubung: ${socket.id}`
  );

  // Menerima pesan dari client
  socket.on("message", (data) => {
    console.log(`Pesan dari ${socket.id}: ${data}`);

    // Broadcast pesan ke semua client
    io.emit("message", {
      userId: socket.id,
      message: data,
      time: new Date().toLocaleTimeString(),
    });
  });

  // Ketika user terputus
  socket.on("disconnect", () => {
    console.log(`User terputus: ${socket.id}`);
    io.emit("userLeft", `User telah terputus: ${socket.id}`);
  });
});

// Jalankan server pada port tertentu
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});

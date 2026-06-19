import app from "./app";
import config from "./config";
import http from "http";
import { Server } from "socket.io";
import { initializeInterviewSocket } from "./sockets/interview.socket";

const start = async () => {
  try {
    console.log(`\n🚀 AI Interviewer Backend`);
    console.log(`   Environment : ${config.env}`);
    console.log(`   Port        : ${config.port}\n`);

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      },
    });

    initializeInterviewSocket(io);

    server.listen(config.port, () => {
      console.log(`✅ Server running → http://localhost:${config.port}`);
      console.log(`   Health check → http://localhost:${config.port}/health\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

start();

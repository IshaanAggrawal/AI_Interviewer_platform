import app from "./app";
import config from "./config";

const start = async () => {
  try {
    console.log(`\n🚀 AI Interviewer Backend`);
    console.log(`   Environment : ${config.env}`);
    console.log(`   Port        : ${config.port}\n`);

    app.listen(config.port, () => {
      console.log(`✅ Server running → http://localhost:${config.port}`);
      console.log(`   Health check → http://localhost:${config.port}/health\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

start();

import { app } from "./app.js";

// Start the server
const port = process.env.PORT || 3000;
const host = "0.0.0.0"; // Listen on all interfaces
app.listen(port, host, () =>
  console.log(`🚀 API Server is running on http://localhost:${port} 🥳`),
);

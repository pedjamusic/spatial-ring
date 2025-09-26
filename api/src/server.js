import { app } from './app.js';

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 API Server is running on http://localhost:${port} 🥳`));

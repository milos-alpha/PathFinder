require('dotenv').config(); // Add this at the very top
const app = require('./app');
const http = require('http');
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
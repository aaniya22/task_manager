require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SmartTask API running in ${process.env.NODE_ENV||'development'} on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect DB', err);
    process.exit(1);
  });

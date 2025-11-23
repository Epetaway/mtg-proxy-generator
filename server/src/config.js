require('dotenv').config();

const APP_MODE = process.env.APP_MODE || 'DEMO';
const DB_FILE = process.env.DB_FILE || (APP_MODE === 'PERSONAL' ? 'local.db' : 'demo.db');

module.exports = {
  APP_MODE,
  DB_FILE,
};

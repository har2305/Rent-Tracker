const oracledb = require('oracledb');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function getConnection() {
  try {
    // Resolve wallet path relative to this file
    const walletPath = path.resolve(__dirname, '..', process.env.DB_WALLET_PATH);
    // console.log('Wallet path resolved to:', walletPath);

    // // Check if wallet directory exists
    // if (!fs.existsSync(walletPath)) {
    //   throw new Error(`Wallet path does not exist: ${walletPath}`);
    // }

    // List files in wallet directory for verification
    const walletFiles = fs.readdirSync(walletPath);
    //console.log('Wallet directory files:', walletFiles);

    oracledb.initOracleClient({
      configDir: walletPath,
    });

    // Optional: print Instant Client version
   // console.log('Oracle Instant Client version:', oracledb.oracleClientVersionString);

    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });

    console.log('✅ Connected to Oracle DB');
    return connection;
  } catch (error) {
    console.error('❌ Oracle DB connection failed:', error);
    throw error;
  }
}

module.exports = getConnection;

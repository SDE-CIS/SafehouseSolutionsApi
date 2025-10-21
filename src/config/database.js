import mssql from 'mssql';
const { connect } = mssql;
import dotenv from 'dotenv';
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool = null;

export const getDbConnection = async () => {
  if (!pool) {
    pool = await connect(config);
  }
  return pool;
};
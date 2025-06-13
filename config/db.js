// config/db.js
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // sesuaikan password MySQL kamu
  database: 'siprakti'
});

connection.connect((err) => {
  if (err) {
    console.error('Koneksi ke database gagal:', err.stack);
    return;
  }
  console.log('Terhubung ke database sebagai id ' + connection.threadId);
});

module.exports = connection;

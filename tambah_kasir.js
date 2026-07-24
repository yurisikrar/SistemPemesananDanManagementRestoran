const path = require('path');
const dotenv = require(path.join(__dirname, 'backend/node_modules/dotenv'));
const mysql = require(path.join(__dirname, 'backend/node_modules/mysql2/promise'));
const bcrypt = require(path.join(__dirname, 'backend/node_modules/bcrypt'));

// Load konfigurasi database dari backend/.env
dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const args = process.argv.slice(2);

const username = args[0];
const password = args[1];
const nama_lengkap = args[2] || username;
const role = args[3] || 'Kasir';

if (!username || !password) {
  console.log('\n❌ ERROR: Username dan Password wajib diisi!\n');
  console.log('Cara penggunaan:');
  console.log('  node tambah_kasir.js <username> <password> "[nama_lengkap]" [role]\n');
  console.log('Contoh:');
  console.log('  node tambah_kasir.js kasir2 123456 "Budi Santoso"');
  console.log('  node tambah_kasir.js dapur1 dapur123 "Staf Dapur Utama" Dapur\n');
  process.exit(1);
}

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'restoran_db',
    });

    const [rows] = await connection.execute(
      'SELECT id FROM staf WHERE username = ? LIMIT 1',
      [username]
    );

    if (rows.length > 0) {
      console.log(`\n⚠️  Username "${username}" sudah terdaftar di database!\n`);
      await connection.end();
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.execute(
      'INSERT INTO staf (username, password, nama_lengkap, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, nama_lengkap, role]
    );

    console.log('\n========================================');
    console.log('✅ SUKSES: Akun Staf Baru Berhasil Dibuat!');
    console.log('========================================');
    console.log(`ID           : ${result.insertId}`);
    console.log(`Username     : ${username}`);
    console.log(`Password     : ${password}`);
    console.log(`Nama Lengkap : ${nama_lengkap}`);
    console.log(`Role         : ${role}`);
    console.log('========================================\n');

  } catch (err) {
    console.error('\n❌ Terjadi Kesalahan:', err.message, '\n');
  } finally {
    if (connection) await connection.end();
  }
}

main();

//node tambah_kasir.js <username> <password> "[nama_lengkap]" [role]

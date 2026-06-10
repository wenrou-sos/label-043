const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const executeSqlFile = async (connection, filePath) => {
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const sql of statements) {
    try {
      await connection.execute(sql);
    } catch (error) {
      if (!error.message.includes('Duplicate') && !error.message.includes('DROP')) {
        console.log(`执行 SQL 警告: ${error.message}`);
      }
    }
  }
};

const initDb = async () => {
  let connection = null;
  let dbConnection = null;

  try {
    console.log('开始创建数据库...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`数据库 ${process.env.DB_NAME} 创建成功！`);
    await connection.end();
    connection = null;

    console.log('开始执行建表脚本...');
    dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    const sqlPath = path.join(__dirname, 'schema.sql');
    await executeSqlFile(dbConnection, sqlPath);
    console.log('建表完成！');

    console.log('开始插入初始化数据...');
    const dataPath = path.join(__dirname, 'seed-data.sql');
    await executeSqlFile(dbConnection, dataPath);
    console.log('初始化数据插入完成！');

    await dbConnection.end();
    dbConnection = null;

    console.log('\n✅ 数据库初始化完成！');
    console.log('数据库: ' + process.env.DB_NAME);
    console.log('主机: ' + process.env.DB_HOST + ':' + process.env.DB_PORT);
    console.log('用户: ' + process.env.DB_USER);
  } catch (error) {
    console.error('初始化失败:', error.message);
    if (connection) {
      try { await connection.end(); } catch (e) {}
    }
    if (dbConnection) {
      try { await dbConnection.end(); } catch (e) {}
    }
    process.exit(1);
  }
};

initDb();

require("dotenv").config();
const development = {
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_HOST,
  dialect: "mysql"
};

module.exports = { development };

// models/index.js 파일의 9번째 라인에서 파일명 변경
//const config = require(__dirname + "/../config/config.js")[env];

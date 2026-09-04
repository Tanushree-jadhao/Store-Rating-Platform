const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ratehub",
  password: "AT270624",
  port: 5432,
});

module.exports = pool;
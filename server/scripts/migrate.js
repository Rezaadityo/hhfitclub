import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Sequelize } from "sequelize";
import sequelize from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../migrations");

await sequelize.query(`
  CREATE TABLE IF NOT EXISTS SequelizeMeta (
    name VARCHAR(255) NOT NULL PRIMARY KEY
  )
`);

const [executedRows] = await sequelize.query("SELECT name FROM SequelizeMeta");
const executed = new Set(executedRows.map((row) => row.name));
const files = (await fs.readdir(migrationsDir)).filter((file) => file.endsWith(".js")).sort();

for (const file of files) {
  if (executed.has(file)) {
    console.log(`Skipping migration ${file}`);
    continue;
  }

  const migration = await import(pathToFileURL(path.join(migrationsDir, file)).href);
  console.log(`Running migration ${file}`);
  await migration.up(sequelize.getQueryInterface(), Sequelize);
  await sequelize.query("INSERT INTO SequelizeMeta (name) VALUES (?)", {
    replacements: [file]
  });
}

await sequelize.close();
console.log("Migrations completed.");

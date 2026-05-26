import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Sequelize } from "sequelize";
import sequelize from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedersDir = path.resolve(__dirname, "../seeders");

await sequelize.query(`
  CREATE TABLE IF NOT EXISTS SequelizeData (
    name VARCHAR(255) NOT NULL PRIMARY KEY
  )
`);

const [executedRows] = await sequelize.query("SELECT name FROM SequelizeData");
const executed = new Set(executedRows.map((row) => row.name));
const files = (await fs.readdir(seedersDir))
  .filter((file) => /^\d+.*\.js$/.test(file))
  .sort();

for (const file of files) {
  if (executed.has(file)) {
    console.log(`Skipping seeder ${file}`);
    continue;
  }

  const seeder = await import(pathToFileURL(path.join(seedersDir, file)).href);
  console.log(`Running seeder ${file}`);
  await seeder.up(sequelize.getQueryInterface(), Sequelize);
  await sequelize.query("INSERT INTO SequelizeData (name) VALUES (?)", {
    replacements: [file]
  });
}

await sequelize.close();
console.log("Seeders completed.");

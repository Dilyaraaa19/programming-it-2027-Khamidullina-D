import path from "node:path";
import { fileURLToPath } from "node:url";
import * as fs from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "data", "tasks.json");

export async function loadTasks() {
  try {
    const text = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(text);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function saveTasks(nextTasks) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  const text = JSON.stringify(nextTasks, null, 2);

  await fs.writeFile(DATA_FILE, text, "utf8");
}
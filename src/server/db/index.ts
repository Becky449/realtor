import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "~/env";
import * as schema from "./schema";

const { DATABASE_HOST, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_PORT } = env;

const dbConfig = {
  host: DATABASE_HOST,
  name: DATABASE_NAME,
  password: DATABASE_PASSWORD,
  port: DATABASE_PORT,
};

export const db = drizzle({ schema });

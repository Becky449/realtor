import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "~/env";
import * as schema from "./schema";
import { Client, ClientConfig } from "pg";

const dbConfig: ClientConfig = {
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
};

const client = new Client(dbConfig);
await client.connect();
export const db = drizzle(client, { schema });

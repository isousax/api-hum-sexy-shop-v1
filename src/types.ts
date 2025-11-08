import type { R2Bucket } from "@cloudflare/workers-types";
import type { D1Database } from "@cloudflare/workers-types";
import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const Task = z.object({
	name: Str({ example: "lorem" }),
	slug: Str(),
	description: Str({ required: false }),
	completed: z.boolean().default(false),
	due_date: DateTime(),
});

export interface Env {
  R2: R2Bucket;
  DB: D1Database;
  DNS: string;
  WORKER_API_KEY: string;
}
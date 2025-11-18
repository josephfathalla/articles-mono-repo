import { auth } from "@my-better-t-app/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

interface CreateContextOptions {
  req: Request;
}

export async function createContext(opts: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(opts.req.headers),
  });
  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

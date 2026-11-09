import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { entries } from "../../../db/schema";
import { env } from "cloudflare:workers";

const cors = { "Access-Control-Allow-Origin": "https://yerk0w.github.io", "Access-Control-Allow-Headers": "Content-Type, X-Access-Key", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS" };
const response = (body: unknown, init: ResponseInit = {}) => Response.json(body, { ...init, headers: { ...cors, ...(init.headers ?? {}) } });
function role(request: Request) { const key = request.headers.get("X-Access-Key"); if (key && key === env.ADMIN_KEY) return "admin"; if (key && key === env.ENTRY_KEY) return "entry"; return null; }
export function OPTIONS() { return new Response(null, { headers: cors }); }
export async function GET(request: Request) { if (!role(request)) return response({ error: "Нет доступа" }, { status: 401 }); const rows = await getDb().select().from(entries).orderBy(desc(entries.id)); return response({ entries: rows }); }
export async function POST(request: Request) { if (!role(request)) return response({ error: "Нет доступа" }, { status: 401 }); const body = await request.json() as { type?: string; amount?: number; title?: string; category?: string }; if (!body.amount || !body.type || !["income", "expense"].includes(body.type)) return response({ error: "Проверь сумму" }, { status: 400 }); const [entry] = await getDb().insert(entries).values({ type: body.type, amount: Math.round(body.amount), title: (body.title || (body.type === "income" ? "Пополнение" : "Платёж")).slice(0, 80), category: (body.category || "Другое").slice(0, 40) }).returning(); return response({ entry }, { status: 201 }); }
export async function DELETE(request: Request) { if (role(request) !== "admin") return response({ error: "Только для владельца" }, { status: 403 }); const id = Number(new URL(request.url).searchParams.get("id")); if (!id) return response({ error: "Нет операции" }, { status: 400 }); await getDb().delete(entries).where(eq(entries.id, id)); return response({ ok: true }); }

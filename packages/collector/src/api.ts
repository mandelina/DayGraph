import { queryDay, queryRange } from "@daygraph/db/queries";
import { createServer, type Server } from "node:http";

export function createApiServer(getHealthPayload: () => unknown) {
  return createServer(async (req, res) => {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    if (req.method === "GET" && url.pathname === "/health") {
      writeJson(res, 200, getHealthPayload());
      return;
    }

    if (req.method === "GET" && url.pathname === "/logs") {
      try {
        const rows = await queryLogs(url.searchParams);
        writeJson(res, 200, rows);
      } catch (err) {
        if (isInvalidDateError(err)) {
          writeJson(res, 400, { error: formatError(err) });
          return;
        }
        console.error("[api] query failed", err);
        writeJson(res, 500, { error: "collector query failed" });
      }
      return;
    }

    res.writeHead(404);
    res.end();
  });
}

export async function startApiServer(
  getHealthPayload: () => unknown,
): Promise<Server> {
  const port = Number(process.env.COLLECTOR_API_PORT || 8787);
  const host = process.env.COLLECTOR_API_HOST || "127.0.0.1";
  const server = createApiServer(getHealthPayload);
  await new Promise<void>((resolve, reject) => {
    const onError = (err: Error) => {
      server.off("listening", onListening);
      reject(err);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
  console.log(`[collector] api listening at http://${host}:${port}`);
  return server;
}

async function queryLogs(query: URLSearchParams) {
  const date = query.get("date");
  const startDateISO = query.get("start");
  const endDateISO = query.get("end");

  if (date) return queryDay(date);
  if (startDateISO && endDateISO) {
    return queryRange(startDateISO, endDateISO);
  }
  if (startDateISO || endDateISO) {
    throw new Error("invalid date range: start and end are required");
  }
  return queryDay(formatLocalDateISO());
}

function writeJson(
  res: import("node:http").ServerResponse,
  status: number,
  body: unknown,
) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function isInvalidDateError(err: unknown) {
  return formatError(err).startsWith("invalid date");
}

function formatError(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

function formatLocalDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

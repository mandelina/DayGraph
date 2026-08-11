import { queryDay } from "@daygraph/db/queries";
import { createServer } from "node:http";
import { parse } from "node:url";

export function startApiServer(getHealthPayload: () => unknown) {
  const port = Number(process.env.COLLECTOR_API_PORT || 8787);
  const host = process.env.COLLECTOR_API_HOST || "127.0.0.1";
  const server = createServer(async (req, res) => {
    const url = parse(req.url || "", true);
    if (req.method === "GET" && url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(getHealthPayload()));
      return;
    }
    if (req.method === "GET" && url.pathname === "/logs") {
      const date =
        typeof url.query.date === "string"
          ? url.query.date
          : formatLocalDateISO();
      try {
        const rows = await queryDay(date);
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(rows));
      } catch (err) {
        console.error("[api] query failed", err);
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "collector query failed" }));
      }
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(port, host, () => {
    console.log(`[collector] api listening at http://${host}:${port}`);
  });
}

function formatLocalDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

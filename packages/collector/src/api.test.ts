import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiServer } from "./api";

const mocks = vi.hoisted(() => ({
  queryDay: vi.fn(),
  queryRange: vi.fn(),
}));

vi.mock("@daygraph/db/queries", () => mocks);

describe("collector HTTP API", () => {
  afterEach(() => {
    mocks.queryDay.mockReset();
    mocks.queryRange.mockReset();
  });

  it("health, day, range, invalid request, and 404 responses are explicit", async () => {
    mocks.queryDay.mockReturnValue([{ app_name: "DayGraph" }]);
    mocks.queryRange.mockReturnValue([{ app_name: "VSCode" }]);
    const server = createApiServer(() => ({ ok: true, status: "healthy" }));
    const baseURL = await listen(server);

    try {
      const health = await fetch(`${baseURL}/health`);
      expect(health.status).toBe(200);
      await expect(health.json()).resolves.toEqual({
        ok: true,
        status: "healthy",
      });

      const day = await fetch(`${baseURL}/logs?date=2026-08-11`);
      expect(day.status).toBe(200);
      await expect(day.json()).resolves.toEqual([{ app_name: "DayGraph" }]);
      expect(mocks.queryDay).toHaveBeenCalledWith("2026-08-11");

      const range = await fetch(
        `${baseURL}/logs?start=2026-08-10&end=2026-08-16`,
      );
      expect(range.status).toBe(200);
      await expect(range.json()).resolves.toEqual([{ app_name: "VSCode" }]);
      expect(mocks.queryRange).toHaveBeenCalledWith(
        "2026-08-10",
        "2026-08-16",
      );

      mocks.queryDay.mockImplementation(() => {
        throw new Error("invalid dateISO: 2026-02-31");
      });
      const invalid = await fetch(`${baseURL}/logs?date=2026-02-31`);
      expect(invalid.status).toBe(400);
      await expect(invalid.json()).resolves.toEqual({
        error: "invalid dateISO: 2026-02-31",
      });

      const missingRangePart = await fetch(
        `${baseURL}/logs?start=2026-08-10`,
      );
      expect(missingRangePart.status).toBe(400);

      const notFound = await fetch(`${baseURL}/unknown`);
      expect(notFound.status).toBe(404);
    } finally {
      await close(server);
    }
  });
});

async function listen(server: ReturnType<typeof createApiServer>) {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("test server did not expose an address");
  }
  return `http://127.0.0.1:${address.port}`;
}

async function close(server: ReturnType<typeof createApiServer>) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

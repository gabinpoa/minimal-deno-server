import { DEFAULT_PORT, getRequestHandler } from "./utils.ts";
import type { ReqHandlerMap, ReqHandler } from "./types.ts";
import { assertEquals } from "assert";

const BASE_URL = `http://localhost:${DEFAULT_PORT}`;

const echoHandlerTuple: [string, ReqHandler] = [
  "/api/echo",
  async (req: Request) => {
    const responseBody = {
      reqBody: req.body ? await req.text() : null,
      reqHeaders: Object.fromEntries(req.headers.entries()),
      reqQuery: Object.fromEntries(new URL(req.url).searchParams.entries()),
      reqEndpoint: new URL(req.url).pathname,
    };
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  },
];

const handlers: ReqHandlerMap = new Map();
handlers.set(...echoHandlerTuple);

const reqHandler = getRequestHandler(handlers);

Deno.test(function testTheTest() {
  handlers.forEach((_handler, path) => {
    const request = new Request(BASE_URL + path);
    const requestPath = new URL(request.url).pathname;
    assertEquals(requestPath, path);
  });
});

Deno.test(async function nothingInReqToEcho() {
  const request = new Request(
    BASE_URL + Array.from(handlers.keys()).filter((key) => key === "/api/echo"),
  );

  const response = await reqHandler(request);
  const responseBody = await response.json();
  assertEquals(response.status, 200);
  assertEquals(responseBody.reqBody, null);
  assertEquals(responseBody.reqQuery, {});
  assertEquals(responseBody.reqHeaders, {});
});

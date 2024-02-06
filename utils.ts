import { exists } from "mod";
import { ReqHandler } from "./types.ts";
import { ReqHandlerMap } from "./types.ts";

export const DEFAULT_PORT = 8000;

async function getPathFileReponse(path: string): Promise<Response> {
  const pathExists = await exists(path);
  if (!pathExists) {
    return getNotFoundResponse();
  }

  try {
    return getHTMLFileResponse(path);
  } catch (error) {
    console.error(error);
    return getNotFoundResponse();
  }
}

function getNotFoundResponse() {
  return new Response(null, { status: 404 });
}

async function getHTMLFileResponse(path: string): Promise<Response> {
  const file = await Deno.open(path, { read: true });
  return new Response(file.readable, {
    headers: {
      "content-type": "text/html",
    },
  });
}

export function getEndpointRequestHandler(
  endpoint: string,
  functions: ReqHandlerMap,
): ReqHandler {
  if (functions.has(endpoint)) {
    return functions.get(endpoint) as ReqHandler;
  } else if (
    endpoint.split("/")[1] === "app" &&
    endpoint.split("/")[-1] === "index.html"
  ) {
    return function () {
      return getPathFileReponse(endpoint);
    };
  } else {
    return function () {
      return getNotFoundResponse();
    };
  }
}

export function getRequestHandler(functions: ReqHandlerMap): ReqHandler {
  return function (req: Request) {
    const endpointPath = new URL(req.url).pathname;
    const endpointHandler = getEndpointRequestHandler(endpointPath, functions);
    return endpointHandler(req);
  };
}

export function getServeFunctionInPort(port: number) {
  return function (functions: ReqHandlerMap): Deno.HttpServer {
    return Deno.serve({ port }, getRequestHandler(functions));
  };
}

export function serve(functions: ReqHandlerMap) {
  return Deno.serve({ port: DEFAULT_PORT }, getRequestHandler(functions));
}

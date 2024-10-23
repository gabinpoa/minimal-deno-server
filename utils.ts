import { existsSync } from "./deps.ts";
import { ReqHandler } from "./types.ts";
import { ReqHandlerMap } from "./types.ts";

export const DEFAULT_PORT = 8000;

function getPathFileReponse(path: string): Response {
    const pathExists = existsSync(path);
    if (!pathExists) {
        return getNotFoundResponse(path);
    }

    try {
        return getHTMLFileResponse(path);
    } catch (error) {
        console.error(error);
        return getNotFoundResponse(path);
    }
}

function getNotFoundResponse(path: string) {
    return new Response(path + " not found", { status: 404 });
}

function getHTMLFileResponse(path: string): Response {
    const fileContent = Deno.readTextFileSync(path);
    return new Response(fileContent, {
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
        endpoint.split("/").at(1) === "app" &&
        endpoint.split("/").at(-1) === "index.html"
    ) {
        return function () {
            return getPathFileReponse(Deno.cwd() + endpoint);
        };
    } else {
        return function () {
            return getNotFoundResponse(endpoint);
        };
    }
}

export function getRequestHandler(functions: ReqHandlerMap): ReqHandler {
    return function (req: Request) {
        const endpointPath = new URL(req.url).pathname;
        const endpointHandler = getEndpointRequestHandler(
            endpointPath,
            functions,
        );
        return endpointHandler(req);
    };
}

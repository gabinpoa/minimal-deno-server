import type { ReqHandlerMap } from "./types.ts";
import { DEFAULT_PORT, getRequestHandler } from "./utils.ts";

export function getServeFunctionInPort(port: number) {
    return function (functions: ReqHandlerMap): Deno.HttpServer {
        return Deno.serve({ port }, getRequestHandler(functions));
    };
}

export function serve(functions: ReqHandlerMap) {
    try {
        return Deno.serve({ port: DEFAULT_PORT }, getRequestHandler(functions));
    } catch (error) {
        console.error(error);
    }
}

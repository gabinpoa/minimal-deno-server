export type ReqHandler = (req: Request) => Promise<Response> | Response;
export type ReqHandlerMap = Map<string, ReqHandler>;

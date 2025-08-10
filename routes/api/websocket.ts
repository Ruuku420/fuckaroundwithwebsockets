import { FreshContext } from "$fresh/server.ts";
import { Cookie, deleteCookie, setCookie, getCookies } from "@std/http/cookie";

export const handler: Handler = (req: Request, ctx: FreshContext): Response => {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.addEventListener("open", () => {
    console.log(ctx.remoteAddr);
    socket.send();
  });

  socket.addEventListener("message", (event) => {
    if (event.data === "ping") {
      socket.send("pong");
    }
  });

  return response;
}

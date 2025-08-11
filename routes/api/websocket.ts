import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "@std/http/cookie";
// import { Queue } from "@justin/data-structures";

const sockets: Record<string, WebSocket> = {};

export const handler: Handler = (req: Request, ctx: FreshContext): Response => {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  let socketID: string;

  if (getCookies(req.headers)?.id !== undefined) {
    socketID = getCookies(req.headers).id;
  } else {
    socketID = crypto.randomUUID();
  }

  sockets[socketID] = socket;

  // const sendQueue = new Queue();

  socket.addEventListener("open", () => {
    // console.log(ctx.remoteAddr);
    socket.send(JSON.stringify({
      id: socketID,
    }));

    socket.send(JSON.stringify({
      users: Object.keys(sockets),
    })); 

  });

  socket.addEventListener("message", (event) => {
    if (event.data === "ping") {
      socket.send("pong");
    }
  });

  socket.addEventListener("close", () => {
    delete sockets[socketID];
  });

  return response;
}

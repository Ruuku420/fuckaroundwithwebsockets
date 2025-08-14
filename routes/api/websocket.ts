import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "@std/http/cookie";
// import { Queue } from "@justin/data-structures";

import { MessageEvents, MessageSystem, PacketType } from "../../shared/api.ts";

const sockets: Record<string, WebSocket> = {};

export const handler: Handler = (
  req: Request,
  ctx: FreshContext,
): Response => {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  const send_macro = (
    socket: WebSocket,
    data: PacketType,
  ): void => socket.send(JSON.stringify(data));

  const broadcast_macro = (
    sockets: WebSocket[],
    data: PacketType,
  ): void => {
    Object.values(sockets)
      .forEach((socket) => send_macro(socket, data));
  };

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

    broadcast_macro(sockets, {
      event: MessageEvents.AddUser,
      payload: { uuidToAdd: socketID },
    });

    send_macro(socket, {
      event: MessageEvents.GetID,
      payload: { uuid: socketID },
    });

    send_macro(socket, {
      event: MessageEvents.ListUsers,
      payload: {
        users: Object.keys(sockets).filter((user) => user !== socketID),
      },
    });
  });

  socket.addEventListener("message", (event) => {
    if (event.data === "ping") {
      socket.send("pong");
    }
  });

  socket.addEventListener("close", () => {
    delete sockets[socketID];

    broadcast_macro(sockets, {
      event: MessageEvents.RemoveUser,
      payload: { uuidToRemove: socketID },
    });
  });

  return response;
};

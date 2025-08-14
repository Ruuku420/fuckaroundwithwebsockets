import { useEffect, useState } from "preact/hooks";
import { Signal, useSignal } from "@preact/signals";

import { MessageEvents, MessageSystem, PacketType } from "../shared/api.ts";

type Status = "Disconnected" | "Connected" | "Error"; // TODO Colors

function StatusBar(props: { state: Signal<Status> }) {
  return (
    <div class="flex justify-end bg-black p-2 w-full">
      <div class="text-gray-300 font-mono">{props.state}</div>
    </div>
  );
}

function UserTab(props: { users: string[] }) {
  return (
    <div class="flex flex-col h-full p-2 w-1/5 bg-slate-200">
      {props.users.length === 0
        ? <div class="italic text-gray-500 text-center">Empty</div>
        : (
          props.users.map((user) => (
            <div class="whitespace-nowrap overflow-x-hidden text-ellipsis w-full text-sm text-center p-2 border border-solid border-slate-950 hover:bg-slate-400 rounded-full cursor-pointer">
              {user}
            </div>
          ))
        )}
    </div>
  );
}

export default function MainScreenView() {
  const connectionStatus = useSignal<Status>("Disconnected");
  const users = useSignal<string[]>([]);

  useEffect(() => {
    const messageSystem = new MessageSystem();
    const socket = new WebSocket("/api/websocket");

    messageSystem.addEventListener(MessageEvents.GetID, (event) => {
      console.log(`client uuid: ${event.data.uuid}`);
    });

    messageSystem.addEventListener(MessageEvents.ListUsers, (event) => {
      users.value = event.data.users;
    });

    messageSystem.addEventListener(MessageEvents.AddUser, (event) => {
      users.value = [...users.value, event.data.uuidToAdd];
    });

    messageSystem.addEventListener(MessageEvents.RemoveUser, (event) => {
      users.value = users.value.filter(
        (user) => user !== event.data.uuidToRemove,
      );
    });

    socket.addEventListener("error", (event) => {
      connectionStatus.value = "Error";
      console.warn(event);
    });

    socket.addEventListener("open", (event) => {
      connectionStatus.value = "Connected";
    });

    socket.addEventListener("close", (event) => {
      connectionStatus.value = "Disconnected";
    });

    socket.addEventListener("message", (event) => {
      const data: PacketType = JSON.parse(event.data);
      messageSystem.parse(data);
    });

    return () => {
      socket.close();
    };
  }, []);

  return (
    <>
      <div class="flex flex-col h-screen">
        <div class="flex flex-row h-full">
          <UserTab users={users.value} />
          <div class="flex-1 bg-slate-400"></div>
        </div>
        <StatusBar state={connectionStatus.value} />
      </div>
    </>
  );
}

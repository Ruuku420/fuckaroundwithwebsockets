import { useEffect, useState } from 'preact/hooks';
import { Signal, useSignal } from '@preact/signals';

type Status = "Disconnected" | "Connected" | "Error" // TODO Colors

class MyWebSocket {
  private constructor(socket: WebSocket, id: string) { }

  public static create(
    connectionStatus: Signal<Status>,
    users: Signal<string[]>,
  ): MyWebSocket {
    const socket = new WebSocket("/api/websocket");

    socket.addEventListener("error", (event) => {
      connectionStatus.value = "Error";
      console.warn(event);
    })

    socket.addEventListener("open", (event) => {
      connectionStatus.value = "Connected";
    })

    socket.addEventListener("close", (event) => {
      connectionStatus.value = "Disconnected";
    })

    socket.addEventListener("message", (event) => {
      const data: unknown = JSON.parse(event.data);
      console.log(data);

      if (data?.users !== undefined) {
        users.value = data.users;
      }
    })

    return new MyWebSocket(socket);
  }

  public close() {
    this.socket.close();
  }
}

// type MyDataType = {
//   Users[],
//   Offers[]
// } 

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
      {
        props.users.map(user => (
          <div class="text-ellipsis w-full text-sm">{user}</div>
        ))
      }
    </div>
  );
}

export default function MainScreenView(
) {
  const connectionStatus = useSignal<Status>("Disconnected");
  const users = useSignal<string[]>([]);

  useEffect(() => {
    const ws = MyWebSocket.create(
      connectionStatus,
      users,
    );

    return () => {
      ws.close();
    }
  }, [])
  
  return (
    <>
      <div class="flex flex-col h-screen">
        <div class="grow overflow-auto">
          <UserTab users={users.value} />
        </div>
        <StatusBar state={connectionStatus.value} />
      </div>
    </>
  )
}


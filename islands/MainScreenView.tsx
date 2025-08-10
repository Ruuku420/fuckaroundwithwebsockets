import { useEffect, useState } from 'preact/hooks';
import { Signal, useSignal } from '@preact/signals';

type Status = "Disconnected" | "Connected" | "Error" // TODO Colors

class MyWebSocket {
  private constructor(socket: WebSocket) { }

  public static create(connectionStatus: Signal<Status>): MyWebSocket {
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
    <div class="bg-black p-2">
      <div class="text-gray-300 font-mono text-right">{props.state}</div>
    </div>
  );
}

export default function MainScreenView(
) {
  const connectionStatus = useSignal<Status>("Disconnected");

  useEffect(() => {
    const ws = MyWebSocket.create(connectionStatus);
    return () => {
      ws.close();
    }
  }, [])
  
  return (
    <>
      <StatusBar state={connectionStatus.value} />
    </>
  )
}


export enum MessageEvents {
  AddUser = "ADD_USR",
  RemoveUser = "DEL_USR",
  ListUsers = "LST_USR",

  GetID = "GET_UID",
}

export interface PacketType {
  event: MessageEvents;
  payload: unknown;
}

class MessageEvent extends Event {
  #data: unknown;

  constructor(event, data) {
    super(event);
    this.#data = data;
  }

  get data() {
    return this.#data;
  }
}

export class MessageSystem extends EventTarget {
  constructor() {
    super();
  }

  parse(message: PacketType): void {
    const customEvent = new MessageEvent(message.event, message.payload);
    this.dispatchEvent(customEvent);
  }
}

export enum MessageEvents {
  AddUser = "ADD_USR",
  RemoveUser = "DEL_USR",
  ListUsers = "LST_USR",

  GetID = "GET_UID",
}

export interface PacketType {
  event: MessageEvents,
  payload: unknown,
}

export class MessageSystem extends EventTarget {
  constructor() {
    super();
  }

  parse(message: PacketType): void {
    const customEvent = new CustomEvent(message.event, message.payload);
    this.dispatchEvent(customEvent);
  }
}

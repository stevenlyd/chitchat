import EventEmitter from "eventemitter3";

class EventBus extends EventEmitter {}

const eventBus = new EventBus();

export enum ApplicationEventTypes {
  WS_MESSAGE = "WS_MESSAGE",
  WS_CONNECT = "WS_CONNECT",
  WS_DISCONNECT = "WS_DISCONNECT",
}

export const subscribeEvents = (
  subscribers:
    | {
        event: ApplicationEventTypes;
        listener: (...args: any[]) => void;
      }[]
    | {
        event: ApplicationEventTypes;
        listener: (...args: any[]) => void;
      }
) => {
  const normalizedSubscribers = Array.isArray(subscribers)
    ? subscribers
    : [subscribers];

  const unsubscribers = normalizedSubscribers.map(({ event, listener }) => {
    eventBus.on(event, listener);
    return () => {
      eventBus.off(event, listener);
    };
  });

  return () => {
    unsubscribers.forEach((unsubscriber) => {
      unsubscriber();
    });
  };
};

export default eventBus;

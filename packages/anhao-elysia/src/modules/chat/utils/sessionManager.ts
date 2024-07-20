import { Room } from "./room";
import { Session } from "./session";

export class SessionManager {
  private idMap = new Map<string, Session>();
  private roomMap = new Map<string, Room>();

  addSession(
    params: Omit<ConstructorParameters<typeof Session>[0], "room"> & {
      roomCode: string;
    }
  ) {
    const { roomCode } = params;
    const matchedRoom = this.roomMap.get(roomCode);
    if (matchedRoom) {
      matchedRoom.addSession(params);
    } else {
      const room = new Room({ roomCode, sessionManager: this });
      this.roomMap.set(roomCode, room);
      room.addSession(params);
    }
  }

  addSessionToIdMap(session: Session) {
    const { id } = session;
    if (id) {
      this.idMap.set(id, session);
    }
  }

  getSessionById(id: string): Session | undefined {
    return this.idMap.get(id);
  }

  getSessionsByRoomCode(roomCode: string): Set<Session> | undefined {
    const decodedRoomCode = decodeURIComponent(roomCode);
    const matchedRoom = this.roomMap.get(decodedRoomCode);
    return matchedRoom?.sessionsSet;
  }

  removeSessionFromIdMap(id: string) {
    this.idMap.delete(id);
  }

  cleanUpDeadSessions = async () => {
    // Clean up sessions in the idMap
    const cleaUpById = async () => {
      const tasks: Promise<boolean>[] = [];
      this.idMap.forEach((session) => {
        tasks.push(session.healthCheck());
      });
      const doneTasks = await Promise.all(tasks);
      return doneTasks.filter((doneTask) => !doneTask).length;
    };

    // Clean up sessions in the roomMap
    const cleanUpByRoom = async () => {
      const tasks: Promise<number>[] = [];
      this.roomMap.forEach((room) => {
        tasks.push(room.cleanUpDeadSessions());
      });
      const doneTasks = await Promise.all(tasks);
      return doneTasks.reduce((acc, curr) => acc + curr, 0);
    };

    const [number1, number2] = await Promise.all([
      cleaUpById(),
      cleanUpByRoom(),
    ]);
    if (number1 > 0 || number2 > 0) {
      console.log(
        `Cleaned up ${number1} sessions in idMap, ${number2} sessions in roomMap`
      );
    }
  };
}

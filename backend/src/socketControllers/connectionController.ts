import { Server, Socket } from "socket.io";
import { prisma } from "../app";

export const getSocketDetails = async (userId: number) => {
  // Get all rooms
  const result = await prisma.participants.findMany({
    where: {
      userId,
      conversationId: {
        not: null
      }
    },
    select: {
      conversationId: true,
    },
  });

  return result.map((room) => room.conversationId?.toString() as string) as string[];
};

export const onlineController = (io: Server, socket: Socket) => {
  socket.on("user:online", async (userId) => {
    // Get user detaiils
    console.log(`User ${userId} is online with socket id ${socket.id}`);
    socket.data.userId = userId;
    const result = await getSocketDetails(userId);
    // Make user join rooms
    for (const room of result) {
      console.log(`User ${userId} is joining rooms ${room}`);
      socket.join(room);
      socket.to(room + "").emit("user:online", userId);
    }

    // TODO Update user status to online, last seen undefined

  });
};

export const offlineController = (io: Server, socket: Socket) => {
  socket.on("user:offline", async (userId) => {
    // Get user detaiils
    const result = await getSocketDetails(userId);

    const time = new Date(Date.now()).toISOString();

    // TODO Update user status to offline, last seen

    socket
      .to(result)
      .emit("user:offline", { userId, time });
  });
};

// socket disconnection
export const disconnectingController = (io: Server, socket: Socket) => {
  socket.on("disconnecting", async (userId) => {
    if (!userId) return;
    
    const result = await getSocketDetails(
      socket.data.userid
    );

    const time = new Date(Date.now()).toISOString();

    // TODO: update user status to offline, last seen

    socket
      .to(result)
      .emit("user:offline", { userId, time });
  });
};

export const joinRoomController = (io: Server, socket: Socket) => {
  socket.on("user:joinRooms", ({ rooms }: {rooms: string[]}) => {
    socket.join(rooms);
  });
};

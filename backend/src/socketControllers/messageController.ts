import { Server, Socket } from "socket.io";
import { getConversationMembers, sendMessage } from '../controllers/conversationController'

export const messagingController = (io: Server, socket: Socket) => {
  socket.on("user:newMessage", async ({ userId, conversationId, content }) => {
    if (!userId) return
    
    // Save message to database
    const result = await sendMessage({content, conversationId, userId});

    // Get all sockets in room
    const socketsInRoom = await io.in(conversationId.toString()).allSockets();
    console.log(`Sockets in room ${conversationId}: ${socketsInRoom.size}`);

    // Get all users in conversation
    const members = await getConversationMembers(conversationId);
    for (const member of members) {
      console.log(`User ${member} is in room ${conversationId}`);
    }

    // Get all socket connections
    const allSockets = await io.fetchSockets();
    for (const socket of allSockets) {
      console.log(`Socket ${socket.id} is connected with user ${socket.data.userId}`);
    }

    // Find and join missing users' sockets to room
    members.forEach(memberId => {
      allSockets.forEach(socket => {
        if (socket.data.userId === memberId && !socketsInRoom.has(socket.id)) {
          console.log(`User ${memberId} is joining room ${conversationId}`);
          socket.join(conversationId + "");
        }
      });
    });

    // Broadcast message to room
    console.log(`User ${userId} sent message to room ${conversationId} with socket id ${socket.id}`);
    io.timeout(180000)
    .to(conversationId + "")
      .emit(
        "user:sendMessage",
        {
          conversationId,
          message: result
        }
      );
  });
};

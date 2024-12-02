import { Server, Socket } from 'socket.io'
import { prisma } from '../app'
import { verifyToken } from './authUtils'
const socketUserMap = new Map<string, string>()
const rooms = new Map<string, string[]>()

export function setupSocketHandlers(io: Server) {
  
  io.use((socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication token required'))
    }

    const payload = verifyToken(token)
    if (!payload) {
      return next(new Error('Invalid or expired token'))
    }

    socket.data.userId = payload.userId
    next()
  })

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.userId}`)
    socketUserMap.set(socket.data.userId, socket.id)

    socket.on('joinRoom', (roomId: string) => {
      rooms.set(roomId, [...(rooms.get(roomId) || []), socket.data.userId])
      console.log(typeof roomId)
      socket.join(roomId.toString())
      console.log(`length: ${rooms.get(roomId)?.length}`)
      console.log(`User joined room ${roomId}`)
    })

    socket.on('inviteClient', ({roomId, clientsId}) => {
      for (const clientId of clientsId) {
        console.log(`Inviting client ${clientId} to room ${roomId}`)
        const socketId = socketUserMap.get(clientId)
        if (socketId) {
          const targetSocket = io.sockets.sockets.get(socketId)
          if (targetSocket) {
            socket.to(targetSocket.id).emit('invitedTo', { roomId })
          }
      }
    }
    })

    socket.on(
      'sendMessage',
      async (data: {
        senderId: number
        content: string
        conversationId: number
        attachmentIds: number[]
      }) => {
        try {
          const { senderId, content, conversationId, attachmentIds } = data

          const message = await prisma.messages.create({
            data: {
              content,
              Users: { connect: { id: senderId } },
              Conversations: { connect: { id: conversationId } },
              Attachments: {
                connect: attachmentIds.map((id) => ({ id }))
              }
            },
            include: {
              Attachments: true
            }
          })

          console.log(message)
          if (message.conversationId) {
            io.to(message.conversationId.toString()).emit('newMessage', message)
          }
        } catch (error) {
          console.error('Error sending message:', error)
        }
      }
    )

    socket.on('disconnect', () => {
      console.log('A user disconnected')
    })
  })
}

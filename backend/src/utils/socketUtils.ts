import { Server, Socket } from 'socket.io'
import { prisma } from '../app'
import { verifyToken } from './authUtils'

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

    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId)
      console.log(`User joined room ${roomId}`)
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
          console.log('Sending message:', data)

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

          io.to(conversationId.toString()).emit('newMessage', message)
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

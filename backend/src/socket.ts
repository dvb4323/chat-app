import { Server } from 'socket.io'
import httpServer from './server'
import { verifyToken } from './utils/authUtils'
import { disconnectingController, joinRoomController, offlineController, onlineController } from './socketControllers/connectionController'
import { messagingController } from './socketControllers/messageController'

const io = new Server(httpServer, {
  cors: {
    // origin: 'http://localhost:5173',
    // methods: ['GET', 'POST']
  }
})

// io.use((socket, next) => {
//   const token = socket.handshake.auth.token

//   if (!token) {
//     return next(new Error('Authentication token required'))
//   }

//   const payload = verifyToken(token)
//   if (!payload) {
//     return next(new Error('Invalid or expired token'))
//   }

//   socket.data.userId = payload.userId
//   next()
// })

io.on('connection', async (socket) => {
  // -------------Connection controls -------------- //
  // socket come online
  onlineController(io, socket);

  // socket goes offline
  offlineController(io, socket);

  // socket disconnecting
  disconnectingController(io, socket);

  // socket joins new room
  joinRoomController(io, socket);

  //--------------------------------------------------//

  // -------------Message controls -------------- //
  messagingController(io, socket);
})

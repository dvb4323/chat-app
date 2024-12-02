import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'

import conversationRoutes from './routes/conversationRoutes'
import attachmentRoutes from './routes/attachmentRoutes'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import { authenticateToken } from './middlewares/auth'
import { setupSocketHandlers } from './utils/socketUtils'
import { initializeBucketR2 } from './utils/r2Utils'
import errorHandler from './middlewares/errorHandler'

const app = express()
const httpServer = createServer(app)

const corsOptions = {
  origin: 'http://localhost:5173'
}

app.use(cors(corsOptions))

const io = new Server(httpServer, {
  cors: {
    // origin: 'https://localhost:5173',
    // methods: ['GET', 'POST']
  }
})
export const prisma = new PrismaClient()
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger_output.json')

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/conversations', authenticateToken, conversationRoutes)
app.use('/api/attachments', authenticateToken, attachmentRoutes)
app.use('/api/users', authenticateToken, userRoutes)
setupSocketHandlers(io)
initializeBucketR2()

app.use(errorHandler)

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

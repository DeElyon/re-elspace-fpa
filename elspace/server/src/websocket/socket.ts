// server/src/websocket/socket.ts
import { Server } from 'socket.io'
import { verify } from 'jsonwebtoken'
import { prisma } from '../database/prisma'

export function setupWebSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.APP_URL || 'http://localhost:3000',
      credentials: true,
    },
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication required'))
      }

      const decoded = verify(token, process.env.JWT_SECRET!) as any
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      })

      if (!user) {
        return next(new Error('User not found'))
      }

      socket.data.user = user
      next()
    } catch (error) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', async (socket) => {
    const user = socket.data.user
    console.log(`User ${user.id} connected`)

    socket.join(`user:${user.id}`)

    socket.on('typing', (data) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing', {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
      })
    })

    socket.on('message:send', async (data) => {
      const { conversationId, content, type = 'TEXT' } = data

      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId,
          userId: user.id,
        },
      })

      if (!participant) return

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: user.id,
          content,
          type: type as any,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      })

      io.to(`conversation:${conversationId}`).emit('message:receive', message)

      const otherParticipants = await prisma.conversationParticipant.findMany({
        where: {
          conversationId,
          userId: { not: user.id },
        },
      })

      otherParticipants.forEach((p) => {
        io.to(`user:${p.userId}`).emit('notification', {
          type: 'NEW_MESSAGE',
          title: 'New Message',
          body: `${user.firstName}: ${content.substring(0, 50)}...`,
          data: { conversationId, messageId: message.id },
        })
      })
    })

    socket.on('session:join', (data) => {
      const { sessionId } = data
      socket.join(`session:${sessionId}`)
      socket.to(`session:${sessionId}`).emit('session:user-joined', {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
      })
    })

    socket.on('session:signal', (data) => {
      const { sessionId, signal } = data
      socket.to(`session:${sessionId}`).emit('session:signal', {
        userId: user.id,
        signal,
      })
    })

    socket.on('disconnect', () => {
      console.log(`User ${user.id} disconnected`)
    })
  })

  return io
}

import { Request, Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import { prisma } from '../app'

export const createNewConversation = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, participantIds } = req.body
    const userId = req.userId

    const conversation = await prisma.conversations.create({
      data: {
        name,
        type: participantIds.length > 1 ? 'group' : 'private',
        Participants: {
          create: [
            { userId: userId! },
            ...participantIds.map((id: number) => ({ userId: id }))
          ]
        }
      },
      include: {
        Participants: {
          include: {
            Users: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    })

    res.status(201).json(conversation)
  } catch (error) {
    res.status(500).json({ error: 'Error creating conversation' })
  }
}

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    
    const conversations = await prisma.conversations.findMany({
      where: {
        Participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        Participants: {
          select: {
            userId: true,
            conversationsId: true,
            Users: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        Messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })
    res.json(conversations)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching conversations' })
  }
}

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const conversation = await prisma.conversations.findMany({
      where: {
        id: parseInt(id),
        Participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        Participants: {
          include: {
            Users: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        Messages: {
          select: {
            content: true,
            senderId: true
          }
        }
      }
    })

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' })
      return
    }

    res.json(conversation)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching conversation' })
  }
}

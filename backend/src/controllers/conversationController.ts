import { Request, Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import { prisma } from '../app'
import { ConversationSelect } from '../models/Conversation'
import { MessageSelect } from '../models/Message'

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
        },
      },
      select: ConversationSelect
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
      select: ConversationSelect
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

    const conversation = await prisma.conversations.findFirst({
      where: {
        id: parseInt(id),
        Participants: {
          some: {
            userId: userId
          }
        }
      },
      select: ConversationSelect
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

export const sendMessage = async (
  {content, conversationId, userId}: {content: string, conversationId: number, userId: number}
) => {
  const message = await prisma.messages.create({
    data: {
      content,
      conversationId,
      senderId: userId
    },
    select: MessageSelect
  })

  return message
}

export const getConversationMembers = async (conversationId: number) => {
  const members = await prisma.participants.findMany({
    where: {
      conversationId
    },
    select: {
      userId: true
    }
  })

  return members.map((member) => member.userId)
}
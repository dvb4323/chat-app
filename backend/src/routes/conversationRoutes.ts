import express from 'express'
import {
  createNewConversation,
  getConversation,
  getConversations
} from '../controllers/conversationController'

const router = express.Router()

router.post('/', createNewConversation)

router.get('/', getConversations)

router.get('/:id', getConversation)

export default router

import express from 'express'
import multer from 'multer'
import { uploadAttachment } from '../controllers/attachmentController'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.put('/upload', upload.single('file'), uploadAttachment)

export default router

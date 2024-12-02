import { Request, Response, NextFunction } from 'express'
import { prisma } from '../app'
import { uploadFileToR2 } from '../utils/r2Utils'

export const uploadAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file
    const messageId = parseInt(req.body.messageId)

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const fileName = `${Date.now()}-${file.originalname}`
    const url = await uploadFileToR2(file.buffer, fileName)

    const attachment = await prisma.attachments.create({
      data: {
        fileName,
        url,
        Messages: { connect: { id: messageId } }
      }
    })

    res
      .status(200)
      .json({ success: true, attachmentUrl: url, attachmentId: attachment.id })
  } catch (error) {
    next(error)
  }
}

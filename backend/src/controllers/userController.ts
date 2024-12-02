import { Request, Response } from 'express'
import { prisma } from '../app'

export async function getAllUser(req: Request, res: Response) {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true
      }
    })

  console.log(users)
    res.status(200).json(users)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

import { Request, Response } from 'express'
import { prisma } from '../app'

export async function getAllUser(req: Request, res: Response) {
  const { search } = req.query
  let users;
  try {
    if (!search) {
      users = await prisma.users.findMany({
        select: {
          id: true,
          username: true,
          email: true
        }
      })
    }

    users = await prisma.users.findMany({
      where: {
        OR: [
          {
            username: {
              contains: search as string
            }
          },
          {
            email: {
              contains: search as string
            }
          }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true
      }
    })

    res.status(200).json(users)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}
import { Request, Response } from 'express'
import { prisma } from '../app'
import {
  generateToken,
  hashPassword,
  comparePasswords
} from '../utils/authUtils'

export async function register(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body

    const existingUser = await prisma.users.findUnique({
      where: { email }
    })
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' })
      return
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.users.create({
      data: {
        email,
        username,
        hashed_password: hashedPassword
      }
    })

    const token = generateToken(user.id)

    res.status(201).json({
      user: { id: user.id, email: user.email, username: user.username },
      token
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error registering user' })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    const user = await prisma.users.findUnique({ where: { email } })
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' })
      return
    }

    const isPasswordValid = await comparePasswords(
      password,
      user.hashed_password
    )
    if (!isPasswordValid) {
      res.status(400).json({ error: 'Invalid credentials' })
      return
    }

    const token = generateToken(user.id)

    res.json({
      user: { id: user.id, email: user.email, username: user.username },
      token
    })
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' })
  }
}

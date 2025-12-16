import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
  })
}

export async function createUser(
  username: string,
  email: string,
  password: string,
  role: UserRole = UserRole.user
) {
  const passwordHash = await hashPassword(password)
  return prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role,
    },
  })
}

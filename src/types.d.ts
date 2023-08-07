import { PrismaClient } from '@prisma/client'
import { AuthenticationState } from '@whiskeysockets/baileys'

export interface CreateNewAuthResult {
  auth: AuthHandler
  mongoDB: PrismaClient
}

export interface useAuthHandlerResult {
  state: AuthenticationState
  saveState: () => Promise<any>
}

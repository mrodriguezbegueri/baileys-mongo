import { PrismaClient } from '@prisma/client'
import { AuthenticationState } from '@whiskeysockets/baileys'
import AuthHandler from './models/auth-handler/AuthHandler'

export interface CreateNewAuthResult {
  auth: AuthHandler
  mongoDB: PrismaClient
}

export interface useAuthHandlerResult {
  state: AuthenticationState
  saveState: () => Promise<any>
}

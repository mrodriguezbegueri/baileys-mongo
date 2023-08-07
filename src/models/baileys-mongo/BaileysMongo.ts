import { PrismaClient } from '@prisma/client'
import AuthHandler from '../auth-handler/AuthHandler'
import { PrismaSingleton } from '../../db/db'
import { CreateNewAuthResult } from '../../types'
class BaileysMongo {
  static _instance = new BaileysMongo()

  private constructor () {}

  private readonly createNewAuth = async (storeKey: string, prismaClient: PrismaClient): Promise<{auth: AuthHandler, mongoDB: PrismaClient}> => {
    try {
      const store = await prismaClient.auth.findFirst({
        where: {
          key: storeKey
        }
      })

      if (store == null) {
        await prismaClient.auth.create({
          data: {
            key: storeKey,
            value: ''
          }
        })
      }

      return {
        auth: new AuthHandler(prismaClient, storeKey),
        mongoDB: prismaClient
      }
    } catch (err) {
      throw new Error('Error creating auth in mongo ---- Error')
    }
  }

  init = async (): Promise<{
    createNewAuth: (
    storeKey: string
    ) => Promise<CreateNewAuthResult>
  }> => {
    const { prismaClient } = await PrismaSingleton.getInstance()

    const createAuthStore = async (storeKey: string): Promise<{auth: AuthHandler, mongoDB: PrismaClient}> => {
      const auth = await this.createNewAuth(storeKey, prismaClient)

      return auth
    }

    return { createNewAuth: createAuthStore }
  }
}

export default BaileysMongo._instance

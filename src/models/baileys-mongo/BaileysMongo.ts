import { PrismaClient } from '@prisma/client'
import AuthHandler from '../auth-handler/AuthHandler'
import { PrismaSingleton } from '../../db/db'
import { CreateNewAuthResult } from '../../types'

export class BaileysMongo {
  static _instance = new BaileysMongo()

  private constructor () {}

  private readonly createNewAuth = async (
    storeKey: string,
    prismaClient: PrismaClient,
    payload: Record<string, any> | undefined
  ): Promise<CreateNewAuthResult> => {
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
            value: '',
            ...(payload ?? {})
          }
        })
      }

      return {
        auth: new AuthHandler(prismaClient, storeKey),
        mongoDB: prismaClient
      }
    } catch (err) {
      throw new Error(err)
    }
  }

  init = async (): Promise<{
    createNewAuth: (
    storeKey: string,
    payload?: Record<string, any>
    ) => Promise<CreateNewAuthResult>
  }> => {
    const { prismaClient } = await PrismaSingleton.getInstance()

    const createAuthStore = async (
      storeKey: string,
      payload?: Record<string, any>
    ): Promise<CreateNewAuthResult> => {
      const auth = await this.createNewAuth(storeKey, prismaClient, payload)

      return auth
    }

    return { createNewAuth: createAuthStore }
  }

  getDb = async (): Promise<PrismaClient> => {
    const { prismaClient } = await PrismaSingleton.getInstance()

    return prismaClient
  }
}

export default BaileysMongo._instance

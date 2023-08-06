import { PrismaClient } from '@prisma/client'

export class PrismaSingleton {
  private static instance: PrismaSingleton
  prismaClient: PrismaClient
  private readonly connectionPromise: Promise<void>

  private constructor () {
    this.prismaClient = new PrismaClient()
    this.connectionPromise = this.prismaClient.$connect()
  }

  async waitForConnection (): Promise<void> {
    await this.connectionPromise
  }

  static async getInstance (): Promise<PrismaSingleton> {
    if (PrismaSingleton.instance === undefined) {
      PrismaSingleton.instance = new PrismaSingleton()
    }
    await PrismaSingleton.instance.waitForConnection()
    return PrismaSingleton.instance
  }
}

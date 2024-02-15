import { AuthenticationCreds, BufferJSON, initAuthCreds, proto, SignalDataSet, SignalDataTypeMap } from '@whiskeysockets/baileys'
import { PrismaClient, Auth } from '@prisma/client'
import { useAuthHandlerResult } from '../../types'

export default class AuthHandler {
  constructor (private readonly prismaCLient: PrismaClient, private readonly key: string) { }

  useAuthHandler = async (): Promise<useAuthHandlerResult> => {
    let creds: AuthenticationCreds
    const authDBCreds = await this.prismaCLient.auth.findFirst({
      where: {
        key: `${this.key}:creds`
      }
    })

    if (authDBCreds !== null && authDBCreds.value !== '') {
      creds = JSON.parse(authDBCreds.value, BufferJSON.reviver)
    } else {
      creds = initAuthCreds()
    }

    const saveInDB = async (keyField: string, dataToSave: any): Promise<Auth> => {
      const dbKey = `${this.key}:${keyField}`

      const saveStatePromise = this.prismaCLient.auth.upsert({
        where: {
          key: dbKey
        },
        update: {
          value: JSON.stringify(dataToSave, BufferJSON.replacer)
        },
        create: {
          key: dbKey,
          value: JSON.stringify(dataToSave, BufferJSON.replacer)
        }
      })

      return await saveStatePromise
    }

    const getFromDB = async (key: string): Promise<Auth | null> => {
      const data = await this.prismaCLient.auth.findFirst({
        where: {
          key
        }
      })

      if (data === null) {
        return null
      }

      return data
    }

    return {
      state: {
        creds,
        keys: {
          get: async <T extends keyof SignalDataTypeMap>(type: T, ids: string[]) => {
            const promises = ids.map(async (id) => await getFromDB(`${this.key}:${type}:${id}`))
            const values = await Promise.all(promises)

            return ids.reduce((dict: any, idx) => {
              const value = values.find((val) => val?.key === `${this.key}:${type}:${idx}`)

              if (value !== undefined && value !== null) {
                const dataParsed = JSON.parse(value.value, BufferJSON.reviver)
                if (type === 'app-state-sync-key') {
                  dict[idx] = proto.Message.AppStateSyncKeyData.fromObject(dataParsed)
                }
                dict[idx] = dataParsed
              }
              return dict
            }, {})
          },
          set: async (data: SignalDataSet) => {
            const dataToSave = []
            for (const _key in data) {
              let signalData = data[_key as keyof SignalDataTypeMap]

              if (signalData === undefined) {
                signalData = {}
              }

              for (const id in signalData) {
                const value = signalData[id] as string
                const key = `${_key}:${id}`
                const dbPromise = saveInDB(key, value)
                dataToSave.push(dbPromise)
              }
            }
            await Promise.all(dataToSave)
          }
        }
      },
      saveState: async () => {
        await saveInDB('creds', creds)
      }
    }
  }

  deleteKeys = async (storeKey: string, prismaCLient: PrismaClient): Promise<void> => {
    await prismaCLient.auth.deleteMany({
      where: {
        key: {
          startsWith: storeKey
        }
      }
    })
  }
}

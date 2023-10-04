import { AuthenticationCreds, BufferJSON, initAuthCreds, proto, SignalDataSet, SignalDataTypeMap } from '@whiskeysockets/baileys'
import { PrismaClient, Auth } from '@prisma/client'
import { useAuthHandlerResult } from '../../types'

const KEY_MAP: { [T in keyof SignalDataTypeMap]: string } = {
  'pre-key': 'preKeys',
  session: 'sessions',
  'sender-key': 'senderKeys',
  'app-state-sync-key': 'appStateSyncKeys',
  'app-state-sync-version': 'appStateVersions',
  'sender-key-memory': 'senderKeyMemory'
}

export default class AuthHandler {
  constructor (private readonly prismaCLient: PrismaClient, private readonly key: string) {}

  useAuthHandler = async (): Promise<useAuthHandlerResult> => {
    let creds: AuthenticationCreds
    let keys: any = {}

    try {
      const authDB = await this.prismaCLient.auth.findFirst({
        where: {
          key: this.key
        }
      })
  
      if (authDB !== null && authDB.value !== '') {
        ({ creds, keys } = JSON.parse(authDB.value, BufferJSON.reviver))
      } else {
        creds = initAuthCreds()
        keys = {}
      }
  
      const saveState = async (): Promise<Auth> => {
        const saveStateResult = await this.prismaCLient.auth.upsert({
          where: {
            key: this.key
          },
          update: {
            value: JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
          },
          create: {
            key: this.key,
            value: JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
          }
        })
    
        return saveStateResult
      }
  
      return {
        state: {
          creds,
          keys: {
            get: <T extends keyof SignalDataTypeMap>(type: T, ids: string[]) => {
              const key = KEY_MAP[type]
              return ids.reduce((dict: any, id) => {
                let value = keys[key]?.[id]
                if (value !== undefined) {
                  if (type === 'app-state-sync-key') {
                    value = proto.Message.AppStateSyncKeyData.fromObject(value)
                  }
                  dict[id] = value
                }
                return dict
              }, {})
            },
            set: async (data: SignalDataSet) => {
              for (const _key in data) {
                const key = KEY_MAP[_key as keyof SignalDataTypeMap]
                if (keys[key] === undefined) {
                  keys[key] = {}
                }
                Object.assign(keys[key], data[_key as keyof SignalDataTypeMap])
              }
  
              await saveState()
            }
          }
        },
        saveState
      }
    } finally {
      await this.prismaCLient.$disconnect()
    }
    
  }
}

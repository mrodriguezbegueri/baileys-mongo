import BaileysMongo from '../models/baileys-mongo/BaileysMongo'
import makeWASocket, { AuthenticationState, DisconnectReason } from '@whiskeysockets/baileys'

const createSocket = async (state: AuthenticationState, saveState: any): Promise<any> => {
  const sock = makeWASocket(
    {
      auth: state,
      keepAliveIntervalMs: 30000,
      printQRInTerminal: true,
      mobile: false,
      syncFullHistory: false
    }
  )

  sock.ev.process(
    async (events: any) => {
      if (events['connection.update'] !== undefined) {
        const update = events['connection.update']
        const { connection, lastDisconnect } = update

        if (connection === 'close') {
          const loggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut

          if (!loggedOut) {
            await createSocket(state, saveState)
          }

          if (loggedOut) {
            console.log('Connection closed by logout')
          }
        }

        console.log('------------ update ------------- ', update)
      }
      if (events['creds.update'] !== undefined) {
        try {
          await saveState()
        } catch (err) {
          console.log('Error save state: ', err)
        }
      }
      if (events['messages.upsert'] !== undefined) {
        const upsert = events['messages.upsert']
        console.log('upsert', JSON.stringify(upsert))
      }
    }
  )
}

const start = async (storeKey: string): Promise<void> => {
  try {
    const { createNewAuth } = await BaileysMongo.init()

    const { auth } = await createNewAuth(storeKey)

    const { state, saveState } = await auth.useAuthHandler()

    await createSocket(state, saveState)
  } catch (err) {
    throw new Error(err)
  }
}

start('storeKeyExample').catch((err) => {
  console.log(`Error starting client ${err.message as string}`)
})

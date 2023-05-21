/* eslint-disable github/no-then */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Client from 'ssh2-sftp-client'
import * as core from '@actions/core'

export async function setupClient(options: Client.ConnectOptions) {
  const client = new Client()
  return client
    .connect(options)
    .catch(() => null)
    .then(() => client)
    .catch(() => {
      core.info(`CONNECT ERROR ----> ${options.host}`)
      return null
    })
}

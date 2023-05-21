/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable github/no-then */
import * as core from '@actions/core'
import Client from 'ssh2-sftp-client'
import {createOptions} from './create-options'
import path from 'path'
import {setupClient} from './setup-clients'
import {uploadFile} from './upload-file'

async function run(): Promise<void> {
  const ignore = JSON.parse(core.getInput('ignore'))
  const file = core.getInput('file')
  const {target, source, clients} = createOptions(
    path.join(process.cwd(), file)
  )
  const client: Client[] = (await Promise.all(
    clients.map(async opt => setupClient(opt))
  ).then(cl => cl.filter(c => !!c))) as any
  const status = await Promise.all(
    client.map(async cli =>
      uploadFile(cli, path.join(process.cwd(), source), target, ignore)
    )
  )
  if (!status.every(s => !!s)) {
    core.error('Upload Error')
    core.setOutput('message', 'Upload Error')
    core.setFailed('Upload Error')
  }
  core.setOutput('message', 'Upload Success')
}

run()

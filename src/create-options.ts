import {readFileSync} from 'fs'
import {get} from 'lodash'
import * as core from '@actions/core'
import {extname} from 'path'
import yaml from 'yaml'

export interface ClientOption {
  host: string
  port: number | undefined
  username: string
  password: string
}

export interface Option {
  target: string
  source: string
  clients: ClientOption[]
}

export function createOptions(file: string): Option {
  const name = extname(file)
  if (!['.yaml', '.yml'].includes(name)) {
    core.error('配置文件需为.yaml格式文件')
    core.setOutput('message', '配置文件需为.yaml格式文件')
    core.setFailed('配置文件需为.yaml格式文件')
  }
  const data = yaml.parse(readFileSync(file, {encoding: 'utf-8'}))
  const target = get(data, 'target')
  const source = get(data, 'source')
  if (![target, source].every(Boolean)) {
    core.error('缺少文件夹地址')
    core.setOutput('message', '缺少文件夹地址')
    core.setFailed('缺少文件夹地址')
  }
  const clients = get(data, 'clients', []).reduce(
    (a: ClientOption[], b: ClientOption) => {
      const host = get(b, 'host')
      const port = get(b, 'port')
      const username = get(b, 'username')
      const password = get(b, 'password')
      if (![host, port, username, password].every(Boolean)) return a
      if (Array.isArray(host)) {
        return a.concat(
          host.map(h => ({
            host: h,
            port: Number(port),
            username,
            password
          }))
        )
      }
      return a.concat([
        {
          host,
          port: Number(port),
          username,
          password
        }
      ])
    },
    []
  )
  if (!clients.length) {
    core.error('缺少主机配置')
    core.setOutput('message', '缺少主机配置')
    core.setFailed('缺少主机配置')
  }
  return {target, source, clients}
}

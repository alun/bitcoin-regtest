#!/usr/bin/env node

const co = require('co')
const fs = require('promise-fs')
const child_process = require('child_process')

'use strict';

function exec(cmd) {
  return new Promise((resolve, reject) =>
    child_process.exec(cmd, (err, stdout, stderr) =>
      err && reject(err) || resolve([stdout, stderr])
    )
  )
}

const [cmd, arg1, arg2] = process.argv.slice(2)

if (cmd == 'config') {
  const number = parseInt(arg1) || 10
  const startPort = parseInt(arg2) || 2000
  const result = []
  for (let i = 0; i < number; i++) {
    result.push({
      name: `user${i}`,
      port: startPort + i,
    })
  }
  const builtConfig = JSON.stringify(result, null, 4)

  co(function * () {
    try {
      yield fs.writeFile('users.json', builtConfig)
    }
    catch (e) {
      console.log(e)
    }
  })
}
else {

  const confFile = cmd || 'users.json'
  const config = require('./' + confFile)

  function * prepareBitcoinConfig() {
    yield fs.mkdir('bitcoin').catch(() => {
    })
    return yield config.map(user => co(function * () {
      const config = yield buildBitcoinConfig(user)
      return yield fs.writeFile('bitcoin/' + user.name, config)
    })).concat(co(buildMainConf))
  }

  function * buildMainConf() {
    const mainConf = yield fs.readFile('templates/server.conf')
    return yield fs.writeFile('bitcoin/bitcoin.conf', mainConf)
  }

  function * buildBitcoinConfig(user) {
    const template = yield fs.readFile('templates/client.conf')
    return template
      .replace(/\${name}/g, user.name)
      .replace(/\${port}/g, user.port)
  }

  function * prepareStartFile() {
    const userServers = config.map(user => `bitcoind -conf=${user.name}`).join('\n')
    const template = yield fs.readFile('templates/run_servers')
    yield fs.writeFile('run_servers', template.replace(/\${userServers}/g, userServers))
    return yield exec('chmod +x run_servers')
  }

  function * prepareRunFile() {
    const template = yield fs.readFile('templates/run')
    const ports = config.map(user => `-p ${user.port}:${user.port}`).join(' ')
    yield fs.writeFile('s/run', template
      .replace(/\${ports}/, ports)
    )
  }

  function * prepareDockerFile() {
    const template = yield fs.readFile('templates/docker-file')
    const names = config.map(user => user.name).join(' ')
    const ports = config.map(user => user.port).join(' ')
    return yield fs.writeFile('Dockerfile', template
      .replace(/\${names}/g, names)
      .replace(/\${ports}/g, ports)
      .replace(/\${confFile}/g, confFile)
    )
  }

  function * prepareCliScripts() {
    const template = yield fs.readFile('templates/cli-script')
    const names = config.map(user => user.name)
    yield fs.mkdir('cli').catch(() => undefined)
    return yield names.map(name => co(function * () {
      yield fs.writeFile(
        `cli/${name}`,
        template.replace(/\${name}/g, name)
      )
      yield exec(`chmod +x cli/${name}`)
    }))
  }

  co(function * () {
    try {
      yield [
        prepareBitcoinConfig(),
        prepareStartFile(),
        prepareDockerFile(),
        prepareCliScripts(),
        prepareRunFile(),
      ]
    }
    catch (e) {
      console.log(e)
    }
  })
}


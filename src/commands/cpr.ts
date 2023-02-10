/* eslint-disable no-console */
import c from 'kleur'
import { runCli } from '../runner'
import { dump, load } from '../storage'
import { Table } from 'console-table-printer'
import GitApi from '../api'

let storage

runCli(async args => {
  storage = await load()
  if (args[0] === '-t') {
    storage.token = args[1]
    await dump()
    console.log(c.green('token set successfully'))
    return
  }

  if (args[0] === '-u') {
    storage.username = args[1]
    await dump()
    console.log(c.green('username set successfully'))
    return
  }

  if (!storage.token) {
    console.log(c.red('use `cpr -t <TOKEN>` to set your token'))
    process.exit(1)
  }

  if (args[0] === '-s') {
    const [owner, repo] = args[1].split('/')
    let username = storage.username!
    if (args[2] === '-u' && args[3]) username = args[3]

    const api = new GitApi(storage.token, owner, repo)
    const prList = await api.searchPR(username)

    if (!prList.length) {
      console.log(c.green('No PRs found'))
      return
    }

    console.log(c.green(`${prList.length} PRs found`))
    const conflictPRs = []
    for (let i = 0; i < prList.length; i++) {
      const pr = prList[i]
      console.log(c.yellow('[Checking...]'), pr.title)
      const info = await api.getPR(pr.number)
      if (!info.mergeable) {
        conflictPRs.push({
          title: pr.title,
          url: pr.html_url
        })
      }
    }

    if (!conflictPRs.length) {
      console.log(c.green('No conflict PRs found'))
      return
    }

    console.log(c.bgRed(`${conflictPRs.length} conflict PRs found`))

    const p = new Table({
      columns: [
        { name: 'title', alignment: 'left' },
        { name: 'url', alignment: 'left' }
      ]
    })
    conflictPRs.forEach(item => {
      p.addRow(item)
    })
    p.printTable()
  }
})

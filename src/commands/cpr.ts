/* eslint-disable no-console */
import { Octokit } from '@octokit/core'
import { runCli } from '../runner'
import { dump, load } from '../storage'

let storage
let octokit: Octokit

runCli(async (args) => {
  storage = await load()
  if (args[0] === '-t') {
    storage.token = args[1]
    await dump()
    console.log('token set successfully')
    return
  }

  if (args[0] === '-u') {
    storage.username = args[1]
    await dump()
    console.log('username set successfully')
    return
  }

  if (!storage.token) {
    console.error('use `cpr -t <TOKEN>` to set your token')
    process.exit(1)
  }

  octokit = new Octokit({
    auth: storage.token,
  })

  if (args[0] === '-s') {
    const [owner, repo] = args[1].split('/')
    let username = storage.username!
    if (args[2] === '-u' && args[3])
      username = args[3]

    const prList = await searchPR(owner, repo, username)

    if (!prList.length) {
      console.log('No PRs found')
      return
    }

    console.log(`${prList.length} PRs found`)
    const conflictPRs = []
    for (let i = 0; i < prList.length; i++) {
      const pr = prList[i]
      console.log('[Checking...] => ', pr.title)
      const info = await getPR(owner, repo, pr.number)
      if (!info.mergeable) {
        conflictPRs.push({
          title: pr.title,
          url: pr.html_url,
        })
      }
    }

    if (!conflictPRs.length) {
      console.log('No conflict PRs found')
      return
    }

    console.log(`${conflictPRs.length} conflict PRs found`)
    console.table(conflictPRs)
  }
})

async function searchPR(owner: string, repo: string, username: string) {
  try {
    const { data } = await octokit.request('GET /search/issues', {
      q: `repo:${owner}/${repo} is:pr is:open author:${username}`,
      per_page: 100,
    })
    return data.items
  } catch (error) {
    console.log(error)
    return []
  }
}

async function getPR(owner: string, repo: string, pull_number: number) {
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
      owner,
      repo,
      pull_number,
    })
    return data
  } catch (error) {
    return { mergeable: true }
  }
}

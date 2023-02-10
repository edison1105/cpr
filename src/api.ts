import { Octokit } from '@octokit/core'

export default class GitApi {
  octokit: Octokit
  owner: string
  repo: string

  constructor(token: string, owner: string, repo: string) {
    this.octokit = new Octokit({
      auth: token
    })
    this.owner = owner
    this.repo = repo
  }

  async searchPR(username: string) {
    try {
      const { data } = await this.octokit.request('GET /search/issues', {
        q: `repo:${this.owner}/${this.repo} is:pr is:open author:${username}`,
        per_page: 100
      })
      return data.items
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async getPR(pull_number: number) {
    try {
      const { data } = await this.octokit.request(
        'GET /repos/{owner}/{repo}/pulls/{pull_number}',
        {
          owner: this.owner,
          repo: this.repo,
          pull_number
        }
      )
      return data
    } catch (error) {
      return { mergeable: true }
    }
  }

  async updatePR(pull_number: number) {
    try {
      await this.octokit.request(
        'PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch',
        {
          owner: this.owner,
          repo: this.repo,
          pull_number
        }
      )
    } catch (error) {}
  }
}

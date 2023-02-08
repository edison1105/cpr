/* eslint-disable no-console */
import c from 'kleur'
import { version } from '../package.json'

export type Runner = (args: string[]) => Promise<void> | void

export async function runCli(fn: Runner) {
  const args = process.argv.slice(2).filter(Boolean)
  try {
    await run(fn, args)
  }
  catch (error) {
    process.exit(1)
  }
}

export async function run(fn: Runner, args: string[]) {
  if (args.length === 1 && (args[0] === '--version' || args[0] === '-v')) {
    console.log(`@edison1105/pr v${version}`)
    return
  }

  if (args.length === 1 && ['-h', '--help'].includes(args[0])) {
    const dash = c.dim('-')
    console.log(c.green(c.bold('@edison1105/pr')) + c.dim(` Check if your PR has conflicts v${version}\n`))
    console.log(`pr   ${dash}  -u <username> set the author name of PRs`)
    console.log(`pr   ${dash}  -t <token> set the token of GitHub`)
    console.log(`pr   ${dash}  -s <owner/repo> [-u <username>] list the PRs which has conflicts`)
    console.log(c.yellow('\ncheck https://github.com/edison1105/pr for more documentation.'))
    return
  }

  await fn(args)
}
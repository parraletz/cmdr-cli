#!/usr/bin/env node

import chalk from 'chalk'
import { Command } from 'commander'
import { createProject } from './commands/create'
import version from './version.json'

const program = new Command()

program
  .name('cmdr')
  .description('CLI tool for generating project templates')
  .version(version.version)

program
  .command('create')
  .description('Create a new project from a template')
  .action(async () => {
    try {
      await createProject()
    } catch (error) {
      console.error(chalk.red('Error:'), error)
      process.exit(1)
    }
  })

program.parse()
